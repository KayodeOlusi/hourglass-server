import crypto from "crypto";
import { AuthProvider, User } from "@prisma/client";
import { lib } from "../../../lib";
import { dao } from "../../../db/dao";
import { Db, isUniqueViolation } from "../../../db/dao/helpers";
import { OAuthProfile } from "../../../lib/pkg/oauth";
import { SignInBody } from "../../../lib/validators/auth";
import {
  BadRequestException,
  ForbiddenException,
  ResourceExistsException,
  UnauthorizedException,
} from "../../../lib/errors";
import { services } from "../index";

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

// Checked before any write, so a deleted or inactive account never gets new rows attached to it.
function assertActive(user: User) {
  if (user.status !== "ACTIVE") throw new ForbiddenException("This account is not active");
}

async function findOrCreateUser(provider: AuthProvider, profile: OAuthProfile, body: SignInBody) {
  const identity = await dao.AuthIdentities.findByProvider(provider, profile.sub, { withDeleted: true });
  if (identity) {
    const user = await dao.User.findById(identity.userId, { withDeleted: true });
    if (!user) throw new UnauthorizedException("Account not found");
    assertActive(user);

    // Re-check ownership of the stored address: marks Workspace identities the backfill couldn't, and drops
    // it if the provider email has since changed. Left as is when the token carries no email.
    const tokenEmail = profile.email?.toLowerCase();
    await dao.AuthIdentities.update(identity.id, {
      lastUsedAt: new Date(),
      emailAuthoritative: tokenEmail ? tokenEmail === identity.emailAtProvider && profile.emailAuthoritative : undefined,
    });
    return await fillMissingName(user, profile, body);
  }

  // Past this point the account is matched or created by email, so the email must be one the provider
  // verified. Otherwise someone could sign up with an unverified victim@x.com, and the real owner would
  // later be linked into the account they control (account pre-hijacking).
  if (!profile.email) throw new BadRequestException("Email is required to create an account");
  if (!profile.emailVerified) throw new UnauthorizedException("Email is not verified by the provider");
  const email = profile.email.toLowerCase();

  const existing = await dao.User.findByEmail(email, { withDeleted: true });
  if (existing) {
    // Linking hands this person an account that already exists, so both sides must prove they own the
    // address: this sign-in, and an identity already on the account. Otherwise an account made from a
    // stale address (e.g. an old work email on a Google account) would absorb the real owner later.
    const identities = await dao.AuthIdentities.findByUserId(existing.id, { withDeleted: true });
    const accountOwnsEmail = identities.some((i) => i.emailAuthoritative && i.emailAtProvider === email);
    if (!profile.emailAuthoritative || !accountOwnsEmail) {
      throw new ResourceExistsException(
        "An account with this email already exists. Sign in with the method you used before",
      );
    }
    assertActive(existing);

    await dao.AuthIdentities.create({
      userId: existing.id,
      provider,
      providerUserId: profile.sub,
      emailAtProvider: email,
      isPrivateEmail: profile.isPrivateEmail,
      emailAuthoritative: profile.emailAuthoritative,
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
        emailAuthoritative: profile.emailAuthoritative,
        lastUsedAt: new Date(),
      },
    },
  });
}

async function registerDevice(userId: string, device: SignInBody["device"], tx: Db) {
  return await dao.UserDevices.upsertByInstallation(
    device.installation_id,
    {
      userId,
      deviceToken: device.device_token,
      platform: device.platform,
      deviceName: device.device_name,
      appVersion: device.app_version,
      osVersion: device.os_version,
      lastSeenAt: new Date(),
    },
    tx,
  );
}

async function createSession(userId: string, deviceId: string, meta: RequestMeta, tx: Db) {
  const refreshToken = services.TokenService.generateRefreshToken();

  const session = await dao.Sessions.create({
    userId,
    deviceId,
    refreshTokenHash: services.TokenService.hash(refreshToken),
    expiresAt: services.TokenService.refreshTokenExpiry(),
    lastUsedAt: new Date(),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  }, tx);

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
    // Verify before consuming the nonce, so a provider outage (503) doesn't burn it and the app can
    // retry with the same id_token. The token must carry this nonce, so it can't be used with another.
    const profile = await lib.oauth.verifyIdToken(provider, body.id_token, body.nonce);
    if (!(await lib.redis.consume(nonceKey(body.nonce)))) {
      throw new UnauthorizedException("Invalid or expired nonce");
    }

    // Two first-time sign-ins for the same account can race to create it. The loser hits the unique
    // constraint; by then the winner's rows exist, so running it again just finds them.
    const user = await findOrCreateUser(provider, profile, body).catch((error) => {
      if (!isUniqueViolation(error)) throw error;
      return findOrCreateUser(provider, profile, body);
    });

    return await dao.transaction(async (tx) => {
      const device = await registerDevice(user.id, body.device, tx);
      const tokens = await createSession(user.id, device.id, meta, tx);

      const now = new Date();
      const updatedUser = await dao.User.update(user.id, { lastLoginAt: now, lastActiveAt: now }, tx);

      return { user: updatedUser, ...tokens };
    });
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
