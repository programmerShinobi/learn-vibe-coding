import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../repositories/auth.repository";
import { generateToken } from "../utils/jwt.utils";
import type { users } from "../schema/auth.schema";

export const registerUser = async (userData: typeof users.$inferInsert) => {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const userToCreate = { ...userData, password: hashedPassword };

  const newUser = await createUser(userToCreate);

  // Guard: ensure the newly created user was returned from the database
  if (!newUser) throw new Error("Failed to create user");

  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginUser = async (credentials: Pick<typeof users.$inferInsert, "email" | "password">) => {
  const user = await findUserByEmail(credentials.email);

  // Guard: user must exist before comparing passwords
  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  // Generate JWT token with user id and email as payload
  const token = generateToken({ id: user.id, email: user.email });

  // Exclude password from returned data for security
  const { password, ...userWithoutPassword } = user;

  return { ...userWithoutPassword, token };
};
