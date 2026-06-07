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
import { authConfig } from "../config/auth.config";
import { isDuplicateKeyError } from "../repositories/db-errors";
import { AppError, ConflictError, UnauthorizedError } from "../errors";
import type { RegisterRequestDto, LoginRequestDto, UserResponseDto, LoginResponseDto } from "../dto/auth.dto";

/**
 * Register a new user. Hashes the password before persisting.
 *
 * Rather than a separate "does this email exist?" check (which is racy — two
 * concurrent requests can both pass it), we rely on the `users.email` unique
 * constraint and translate the resulting duplicate-key error into a
 * `ConflictError`. This closes the TOCTOU window.
 */
export const registerUser = async (userData: RegisterRequestDto): Promise<UserResponseDto> => {
  // Hash password with an OWASP-recommended cost factor before persistence.
  const hashedPassword = await bcrypt.hash(userData.password, authConfig.bcryptCost);

  let newUser: Awaited<ReturnType<typeof createUser>>;
  try {
    newUser = await createUser({ ...userData, password: hashedPassword });
  } catch (error) {
    // The unique constraint on `email` is the source of truth for duplicates.
    if (isDuplicateKeyError(error)) {
      throw new ConflictError("User already exists");
    }
    throw error;
  }

  // Guard: ensure the newly created user was returned from the database.
  if (!newUser) throw new AppError("Failed to create user", 500);

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
  if (!user) throw new UnauthorizedError("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

  // Generate a JWT containing only the minimal identity payload.
  const token = generateToken({ id: user.id, email: user.email });

  // Exclude password from the returned response DTO.
  const { password, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, token };
};
