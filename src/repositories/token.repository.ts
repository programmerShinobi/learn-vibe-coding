import { db } from "../db";
import { revoked_tokens } from "../schema/token.schema";

/**
 * Insert a revoked token into the database so future requests using the token
 * can be rejected.
 * @param token - the full JWT string to revoke
 * @param expiresAt - the token's expiration timestamp (seconds or Date)
 */
export const revokeToken = async (token: string, expiresAt: Date) => {
  await db.insert(revoked_tokens).values({ token, expiresAt }).run();
};

/**
 * Check whether the provided token has been revoked.
 */
export const isTokenRevoked = async (token: string) => {
  const rows = await db.select().from(revoked_tokens).where(revoked_tokens.token.eq(token)).limit(1);
  return !!rows[0];
};
