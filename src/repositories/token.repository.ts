import { eq } from "drizzle-orm";
import { db } from "../db";
import { revoked_tokens } from "../schema/token.schema";

/**
 * Insert a revoked token into the database so future requests using the token
 * can be rejected.
 * @param token - the full JWT string to revoke
 * @param expiresAt - the token's expiration timestamp (seconds or Date)
 */
export const revokeToken = async (token: string, expiresAt: Date) => {
  await db.insert(revoked_tokens).values({ token, expiresAt });
};

/**
 * Check whether the provided token has been revoked.
 */
export const isTokenRevoked = async (token: string) => {
  const rows = await db.select().from(revoked_tokens).where(eq(revoked_tokens.token, token));
  return !!rows[0];
};
