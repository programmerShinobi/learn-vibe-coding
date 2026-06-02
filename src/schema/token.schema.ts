import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

/*
  Revoked tokens table schema

  Stores JWTs that have been explicitly revoked before their natural expiry.
  Fields:
  - `id`: primary key.
  - `token`: full JWT string (stored for lookup). Keep length generous.
  - `expiresAt`: token expiration time (used for cleanup of old records).
  - `createdAt`: when the token was revoked.

  Note: For production, consider hashing the token value before storing to
  avoid storing sensitive data in the DB in plaintext.
*/
export const revoked_tokens = mysqlTable("revoked_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 1024 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
