/*
  Authentication service

  This module implements business logic for registering and logging in users.
  It leverages repository functions for persistence and utility functions for
  cryptography and tokens. Responsibilities include:
  - Checking for existing users during registration.
  - Hashing passwords before storing them.
  - Validating credentials and issuing JWTs on successful login.

  Service functions accept request DTOs and return response DTOs, keeping the
  Drizzle schema types (`$inferInsert`) internal to the repository layer.

  Errors are thrown with simple messages; controllers map these to appropriate
  HTTP responses.
*/
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../repositories/auth.repository";
import { generateToken } from "../utils/jwt.utils";
import type { RegisterRequestDto, LoginRequestDto, UserResponseDto, LoginResponseDto } from "../dto/auth.dto";

/**
 * Register a new user. Hashes the password before persisting.
 * Throws if the email is already taken or the DB insert fails.
 */
export const registerUser = async (userData: RegisterRequestDto): Promise<UserResponseDto> => {
  // Prevent duplicate registrations.
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password with a reasonable cost factor before persistence.
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = await createUser({ ...userData, password: hashedPassword });

  // Guard: ensure the newly created user was returned from the database.
  if (!newUser) throw new Error("Failed to create user");

  // Strip password before returning — the response DTO never includes it.
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Validate credentials and return user data plus a signed JWT on success.
 * Throws "Invalid credentials" for both unknown email and wrong password
 * to avoid leaking which field was incorrect.
 */
export const loginUser = async (credentials: LoginRequestDto): Promise<LoginResponseDto> => {
  const user = await findUserByEmail(credentials.email);

  // Guard: user must exist before comparing passwords.
  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  // Generate a JWT containing only the minimal identity payload.
  const token = generateToken({ id: user.id, email: user.email });

  // Exclude password from the returned response DTO.
  const { password, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, token };
};
