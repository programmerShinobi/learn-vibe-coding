/*
  Token repository

  Low-level database access for the `revoked_tokens` table. Used by the auth
  middleware to reject tokens that were explicitly invalidated on logout.

  Exports:
  - `revokeToken(token, expiresAt)` - persist a revoked JWT (by hash).
  - `isTokenRevoked(token)` - check whether a given JWT has been revoked.
  - `deleteExpiredTokens()` - purge rows whose tokens have already expired.

  Security: tokens are never stored verbatim. We store a SHA-256 hash of the
  JWT and look up by that hash, so a database leak does not expose usable
  bearer tokens. The hash is deterministic, which is exactly what a membership
  check needs (no per-row salt required).
*/
import { createHash } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { db } from "../db";
import { revoked_tokens } from "../schema/token.schema";

/** Deterministic SHA-256 hash (hex) of a token for storage and lookup. */
const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

/**
 * Insert a revoked token into the database so future requests using the token
 * can be rejected. Only the token's hash is persisted.
 * @param token - the full JWT string to revoke
 * @param expiresAt - the token's expiration timestamp, used for later cleanup
 */
export const revokeToken = async (token: string, expiresAt: Date) => {
  await db.insert(revoked_tokens).values({ tokenHash: hashToken(token), expiresAt });
};

/**
 * Check whether the provided token has been revoked.
 */
export const isTokenRevoked = async (token: string) => {
  const rows = await db
    .select()
    .from(revoked_tokens)
    .where(eq(revoked_tokens.tokenHash, hashToken(token)));
  return !!rows[0];
};

/**
 * Delete revoked-token rows whose `expiresAt` is in the past. Once a token has
 * expired it is rejected by signature verification anyway, so the revocation
 * record is no longer needed. Returns nothing; callers may run this on a timer.
 */
export const deleteExpiredTokens = async () => {
  await db.delete(revoked_tokens).where(lt(revoked_tokens.expiresAt, new Date()));
};
