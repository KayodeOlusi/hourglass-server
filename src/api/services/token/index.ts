import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Exception } from "../../../lib/errors";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL_DAYS = 180;

type AccessTokenPayload = {
  sub: string; // user id
  sid: string; // session id
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Exception("JWT_SECRET is not configured");
  return secret;
}

const TokenService = {
  generateAccessToken({ sub, sid }: AccessTokenPayload) {
    return jwt.sign({ sid }, getSecret(), { subject: sub, expiresIn: ACCESS_TOKEN_TTL, algorithm: "HS256" });
  },
  verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ["HS256"] }) as jwt.JwtPayload;
    return { sub: decoded.sub as string, sid: decoded.sid as string };
  },
  generateRefreshToken() {
    return crypto.randomBytes(32).toString("base64url");
  },
  refreshTokenExpiry() {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  },
  hash(value: string) {
    return crypto.createHash("sha256").update(value).digest("hex");
  },
};

export { TokenService };
export type { AccessTokenPayload };
