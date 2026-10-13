import crypto from "crypto";
import { AuthProvider } from "@prisma/client";
import { createRemoteJWKSet, errors, jwtVerify, JWTPayload } from "jose";
import { loggerActions as logger } from "../logger";
import { Exception, ServiceUnavailableException, UnauthorizedException } from "../errors";

type OAuthProfile = {
  sub: string;
  email?: string;
  emailVerified: boolean;
  emailAuthoritative: boolean;
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

// Apple only issues verified addresses (real or private relay). Google is only the authority for
// Gmail and Workspace (hd) addresses; any other address was verified at sign-up but may since have
// changed hands (person left the company, domain expired and was re-registered).
function isEmailAuthoritative(provider: AuthProvider, payload: JWTPayload) {
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
  if (!email || !isTrue(payload.email_verified)) return false;
  if (provider === "apple") return true;

  const domain = email.split("@")[1];
  const hostedDomain = typeof payload.hd === "string" ? payload.hd.toLowerCase() : undefined;
  return domain === "gmail.com" || domain === "googlemail.com" || (!!hostedDomain && domain === hostedDomain);
}

// Some SDKs put the raw nonce in the token, others its sha256; accept either.
function verifyNonce(payload: JWTPayload, nonce: string) {
  const claim = payload.nonce;
  const hashed = crypto.createHash("sha256").update(nonce).digest("hex");
  if (claim !== nonce && claim !== hashed) throw new UnauthorizedException("Invalid nonce");
}

const oauthActions = {
  async verifyIdToken(provider: AuthProvider, idToken: string, nonce: string): Promise<OAuthProfile> {
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
      emailAuthoritative: isEmailAuthoritative(provider, payload),
      isPrivateEmail: isTrue(payload.is_private_email),
      firstName: payload.given_name as string | undefined,
      lastName: payload.family_name as string | undefined,
      avatarUrl: payload.picture as string | undefined,
    };
  },
};

export { oauthActions };
export type { OAuthProfile };
