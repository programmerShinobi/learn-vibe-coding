/*
  Users table schema (Drizzle ORM)

  This file defines the `users` table used for authentication. Fields:
  - `id`: primary auto-incrementing integer identifier.
  - `name`: user's display name (required).
  - `email`: unique, required email used for login and lookup.
  - `password`: hashed password stored as a string (required).
  - `createdAt` / `updatedAt`: timestamps for auditing and concurrency.

  The schema is used by Drizzle to provide typed query builders and to
  generate SQL migrations when combined with migration tooling.
*/
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  // Stored hashed password. Do not store plaintext passwords.
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
