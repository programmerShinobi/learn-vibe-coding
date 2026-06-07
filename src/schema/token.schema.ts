import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

/*
  Revoked tokens table schema

  Stores JWTs that have been explicitly revoked before their natural expiry.
  Fields:
  - `id`: primary key.
  - `tokenHash`: SHA-256 hash (hex) of the JWT. The raw token is never stored,
    so a database leak does not expose usable bearer tokens. Unique for fast
    membership checks. SHA-256 hex is always 64 chars.
  - `expiresAt`: token expiration time (used for cleanup of old records).
  - `createdAt`: when the token was revoked.
*/
export const revoked_tokens = mysqlTable("revoked_tokens", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
