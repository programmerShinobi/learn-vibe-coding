/*
  Authentication controllers

  This module implements HTTP handlers for authentication-related endpoints.
  Controllers in this project follow a consistent pattern:
  - Validate input using functions from `src/utils/request-validation`.
  - Call service-layer functions to execute business logic.

  Controllers do not catch errors. Validators and services throw typed errors
  (`ValidationError`, `UnauthorizedError`, `ConflictError`, …) and Express 5
  forwards rejected promises from async handlers to the centralized error
  middleware (`src/middlewares/error.middleware.ts`).

  Responses are JSON objects with the shape: `{ message: string, data: any }`.
  Controllers avoid direct DB access and delegate persistence to repositories
  via service functions.
*/
import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { validateLoginInput, validateRegisterInput } from "../utils/request-validation";
import { revokeToken } from "../repositories/token.repository";
import { decodeToken } from "../utils/jwt.utils";

/**
 * POST /api/v1/auth/register
 * Register a new user using form-data fields: name, email, password
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = validateRegisterInput(req.body);
  const user = await registerUser({ name, email, password });

  res.status(201).json({ message: "User created successfully", data: user });
};

/**
 * POST /api/v1/auth/login
 * Login with email and password. Returns user data + JWT token.
 * Does NOT require an existing JWT to call.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = validateLoginInput(req.body);
  const result = await loginUser({ email, password });

  res.status(200).json({ message: "User logged in successfully", data: result });
};

/**
 * POST /api/v1/auth/logout
 * Logout the currently authenticated user by revoking the presented token.
 * The client is also responsible for discarding the token.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // If the client provided an Authorization header, revoke that token.
  const authHeader = req.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
  if (token) {
    // Decode (without re-verifying — the middleware already verified it) to
    // read the token's expiry, so an accurate `expiresAt` is stored and the
    // row can be purged by the cleanup job once the token would expire anyway.
    const decoded = decodeToken(token) as { exp?: number } | null;
    const exp = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);
    await revokeToken(token, exp);
  }

  res.status(200).json({ message: "User logged out successfully", data: null });
};
