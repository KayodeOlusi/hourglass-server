import crypto from "crypto";
import { AuthProvider, User } from "@prisma/client";
import { lib } from "../../../lib";
import { dao } from "../../../db/dao";
import { OAuthProfile } from "../../../lib/pkg/oauth";
import { SignInBody } from "../../../lib/validators/auth";
import { BadRequestException, ForbiddenException, UnauthorizedException } from "../../../lib/errors";
import {services} from "../index";

type RequestMeta = {
  userAgent?: string;
  ipAddress?: string;
};

const NONCE_TTL_SECONDS = 600;

function nonceKey(nonce: string) {
  return `auth:nonce:${nonce}`;
}

// Apple only sends the user's name on the very first authorization, and only to the app, so the
// app forwards it in the body. Fill it in whenever the account doesn't have one yet.
async function fillMissingName(user: User, profile: OAuthProfile, body: SignInBody) {
  const firstName = user.firstName ?? profile.firstName ?? body.first_name;
  const lastName = user.lastName ?? profile.lastName ?? body.last_name;

  if (firstName === user.firstName && lastName === user.lastName) return user;
  return await dao.User.update(user.id, { firstName, lastName });
}

async function findOrCreateUser(provider: AuthProvider, profile: OAuthProfile, body: SignInBody) {
  const identity = await dao.AuthIdentities.findByProvider(provider, profile.sub, { withDeleted: true });
  if (identity) {
    await dao.AuthIdentities.update(identity.id, { lastUsedAt: new Date() });
    const user = await dao.User.findById(identity.userId, { withDeleted: true });
    return user && (await fillMissingName(user, profile, body));
  }

  if (!profile.email) throw new BadRequestException("Email is required to create an account");
  const email = profile.email.toLowerCase();

  const existing = await dao.User.findByEmail(email, { withDeleted: true });
  if (existing) {
    if (!profile.emailVerified) throw new UnauthorizedException("Email is not verified by the provider");

    await dao.AuthIdentities.create({
      userId: existing.id,
      provider,
      providerUserId: profile.sub,
      emailAtProvider: email,
      isPrivateEmail: profile.isPrivateEmail,
      lastUsedAt: new Date(),
    });
    return await fillMissingName(existing, profile, body);
  }

  return await dao.User.create({
    email,
    firstName: profile.firstName ?? body.first_name,
    lastName: profile.lastName ?? body.last_name,
    avatarUrl: profile.avatarUrl,
    authIdentities: {
      create: {
        provider,
        providerUserId: profile.sub,
        emailAtProvider: email,
        isPrivateEmail: profile.isPrivateEmail,
        lastUsedAt: new Date(),
      },
    },
  });
}

async function registerDevice(userId: string, device: SignInBody["device"]) {
  const data = {
    userId,
    platform: device.platform,
    deviceName: device.device_name,
    appVersion: device.app_version,
    osVersion: device.os_version,
    lastSeenAt: new Date(),
  };

  if (device.device_token) return await dao.UserDevices.upsertByToken(device.device_token, data);
  return await dao.UserDevices.create(data);
}

async function createSession(userId: string, deviceId: string, meta: RequestMeta) {
  const refreshToken = services.TokenService.generateRefreshToken();

  const session = await dao.Sessions.create({
    userId,
    deviceId,
    refreshTokenHash: services.TokenService.hash(refreshToken),
    expiresAt: services.TokenService.refreshTokenExpiry(),
    lastUsedAt: new Date(),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  return {
    accessToken: services.TokenService.generateAccessToken({ sub: userId, sid: session.id }),
    refreshToken,
  };
}

const AuthService = {
  // One-time nonce the app bakes into the provider sign-in request. Stored in Redis so the server
  // only accepts nonces it issued, and consumed on use so a captured id_token can't be replayed.
  async createNonce() {
    const nonce = crypto.randomBytes(16).toString("base64url");
    await lib.redis.addWithExp(nonceKey(nonce), "1", NONCE_TTL_SECONDS);
    return nonce;
  },

  async signIn(provider: AuthProvider, body: SignInBody, meta: RequestMeta) {
    // Required for Apple; Google clients don't all support it, so it's checked when sent.
    if (provider === "apple" && !body.nonce) throw new BadRequestException("nonce is required for Apple sign-in");
    if (body.nonce && !(await lib.redis.consume(nonceKey(body.nonce)))) {
      throw new UnauthorizedException("Invalid or expired nonce");
    }

    const profile = await lib.oauth.verifyIdToken(provider, body.id_token, body.nonce);

    const user = await findOrCreateUser(provider, profile, body);
    if (!user) throw new UnauthorizedException("Account not found");
    if (user.status !== "ACTIVE") throw new ForbiddenException("This account is not active");

    const device = await registerDevice(user.id, body.device);
    const tokens = await createSession(user.id, device.id, meta);

    const now = new Date();
    const updatedUser = await dao.User.update(user.id, { lastLoginAt: now, lastActiveAt: now });

    return { user: updatedUser, ...tokens };
  },


  async refresh(refreshToken: string) {
    const oldHash = services.TokenService.hash(refreshToken);
    const session = await dao.Sessions.findActiveByHash(oldHash);
    if (!session) throw new UnauthorizedException("Invalid or expired refresh token");

    const newRefreshToken = services.TokenService.generateRefreshToken();
    const rotated = await dao.Sessions.rotate(session.id, oldHash, services.TokenService.hash(newRefreshToken));
    if (!rotated) throw new UnauthorizedException("Invalid or expired refresh token");

    return {
      accessToken: services.TokenService.generateAccessToken({ sub: session.userId, sid: session.id }),
      refreshToken: newRefreshToken,
    };
  },

  async logout(sessionId: string) {
    await dao.Sessions.revoke(sessionId);
  },

  async logoutAll(userId: string) {
    await dao.Sessions.revokeAllByUserId(userId);
  },
};

export { AuthService };
