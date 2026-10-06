import crypto from "crypto";
import { AuthProvider } from "@prisma/client";
import { createRemoteJWKSet, errors, jwtVerify, JWTPayload } from "jose";
import { loggerActions as logger } from "../logger";
import { Exception, ServiceUnavailableException, UnauthorizedException } from "../errors";

type OAuthProfile = {
  sub: string;
  email?: string;
  emailVerified: boolean;
  isPrivateEmail: boolean;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

const providers = {
  google: {
    jwks: createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs")),
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audienceEnv: "GOOGLE_CLIENT_IDS",
  },
  apple: {
    jwks: createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys")),
    issuer: "https://appleid.apple.com",
    audienceEnv: "APPLE_CLIENT_IDS",
  },
};

const INVALID_TOKEN_ERRORS = [
  errors.JWTExpired,
  errors.JWTClaimValidationFailed,
  errors.JWTInvalid,
  errors.JWSInvalid,
  errors.JWSSignatureVerificationFailed,
  errors.JWKSNoMatchingKey,
  errors.JWKSMultipleMatchingKeys,
  errors.JOSEAlgNotAllowed,
  errors.JOSENotSupported,
];

function getAudience(envName: string) {
  const audience = (process.env[envName] ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!audience.length) throw new Exception(`${envName} is not configured`);
  return audience;
}

function isTrue(claim: unknown) {
  return claim === true || claim === "true";
}

function verifyNonce(payload: JWTPayload, nonce?: string) {
  const claim = payload.nonce as string | undefined;
  if (nonce === undefined && claim === undefined) return;

  const hashed = nonce && crypto.createHash("sha256").update(nonce).digest("hex");
  if (!nonce || !claim || (claim !== nonce && claim !== hashed)) {
    throw new UnauthorizedException("Invalid nonce");
  }
}

const oauthActions = {
  async verifyIdToken(provider: AuthProvider, idToken: string, nonce?: string): Promise<OAuthProfile> {
    const config = providers[provider];
    const audience = getAudience(config.audienceEnv);

    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(idToken, config.jwks, {
        issuer: config.issuer,
        audience,
        algorithms: ["RS256"],
        requiredClaims: ["sub"],
      }));
    } catch (error) {
      if (INVALID_TOKEN_ERRORS.some((InvalidError) => error instanceof InvalidError)) {
        throw new UnauthorizedException("Invalid id_token");
      }
      logger.error(`Could not verify ${provider} id_token`, error as Error);
      throw new ServiceUnavailableException(`${provider} sign-in is temporarily unavailable. Try again shortly`);
    }

    verifyNonce(payload, nonce);

    return {
      sub: payload.sub as string,
      email: payload.email as string | undefined,
      emailVerified: isTrue(payload.email_verified),
      isPrivateEmail: isTrue(payload.is_private_email),
      firstName: payload.given_name as string | undefined,
      lastName: payload.family_name as string | undefined,
      avatarUrl: payload.picture as string | undefined,
    };
  },
};

export { oauthActions };
export type { OAuthProfile };
