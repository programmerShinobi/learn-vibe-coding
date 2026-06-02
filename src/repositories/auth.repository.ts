import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema/auth.schema";

export const findUserByEmail = async (email: string) => {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
};

export const createUser = async (userData: typeof users.$inferInsert) => {
  const [result] = await db.insert(users).values(userData);
  const newUser = await db.select().from(users).where(eq(users.id, result.insertId)).limit(1);
  return newUser[0];
};
