/*
  JWT helper utilities

  This module encapsulates token generation and verification logic used by the
  authentication system. It uses `jsonwebtoken` and the `jwtConfig` exported
  from the configuration module to ensure consistent signing options.

  Exports:
  - `AuthTokenPayload`: Type describing the shape of payload embedded in tokens.
  - `generateToken(payload)`: Sign a payload and return a JWT string.
  - `verifyToken(token)`: Verify a token and return the decoded payload or
    throw if verification fails.

  Notes on types and runtime behavior:
  - The JWT payload is intentionally small (id + email) to keep tokens compact.
  - `verifyToken` delegates to `jsonwebtoken` and therefore may return an
    object or a string depending on how tokens were encoded; callers should
    treat the result as `unknown` and narrow appropriately.
*/
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";

export type AuthTokenPayload = {
  // Numeric user identifier used to look up user records.
  id: number;
  // User email address; included so services can access it without DB lookup.
  email: string;
};

/**
 * Generate a signed JWT for the given payload.
 * @param payload - Minimal user data to embed in the token.
 * @returns A signed JWT string.
 */
export const generateToken = (payload: AuthTokenPayload): string => {
  const expiresIn = jwtConfig.expiresIn as SignOptions["expiresIn"];
  return jwt.sign(payload, jwtConfig.secret, { expiresIn });
};

/**
 * Decode a JWT without verifying its signature.
 * Returns the decoded payload (or `null` for malformed tokens). Use only when
 * the token has already been verified elsewhere — e.g. reading `exp` on logout
 * after the `authenticate` middleware has validated the token.
 */
export const decodeToken = (token: string): unknown => {
  return jwt.decode(token);
};

/**
 * Verify a JWT and return the decoded payload.
 * Throws an error when the token is invalid or expired.
 * The return type is left as `unknown` to force callers to validate shape.
 */
export const verifyToken = (token: string): unknown => {
  return jwt.verify(token, jwtConfig.secret);
};
