/*
  Authentication repository

  This module contains low-level database access functions for the `users`
  table. Each function returns raw rows from the database and is intentionally
  minimal so higher-level services can implement business logic and error
  messages.

  Exports:
  - `findUserByEmail(email)` - fetch a single user row by email or `undefined`.
  - `createUser(userData)` - insert a new user and return the created row.
*/
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema/auth.schema";

export const findUserByEmail = async (email: string) => {
  // Query for a single user by email. Return undefined when not found.
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
};

export const createUser = async (userData: typeof users.$inferInsert) => {
  // Insert and then select the newly created row so callers receive the full
  // database representation (including generated id and timestamps).
  const [result] = await db.insert(users).values(userData);
  const newUser = await db.select().from(users).where(eq(users.id, result.insertId)).limit(1);
  return newUser[0];
};
