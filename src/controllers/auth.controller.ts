/*
  Authentication controllers

  This module implements HTTP handlers for authentication-related endpoints.
  Controllers in this project follow a consistent pattern:
  - Validate input using functions from `src/utils/request-validation`.
  - Call service-layer functions to execute business logic.
  - Map thrown errors to appropriate HTTP status codes and JSON responses.

  Responses are JSON objects with the shape: `{ message: string, data: any }`.
  Controllers avoid direct DB access and delegate persistence to repositories
  via service functions.
*/
import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { validateLoginInput, validateRegisterInput } from "../utils/request-validation";
import { revokeToken } from "../repositories/token.repository";

/**
 * POST /api/v1/auth/register
 * Register a new user using form-data fields: name, email, password
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = validateRegisterInput(req.body);
    const user = await registerUser({ name, email, password });

    res.status(201).json({ message: "User created successfully", data: user });
  } catch (error: any) {
    // Handle expected business logic errors (e.g. user already exists)
    res.status(400).json({ message: error.message || "Registration failed", data: null });
  }
};

/**
 * POST /api/v1/auth/login
 * Login with email and password. Returns user data + JWT token.
 * Does NOT require an existing JWT to call.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = validateLoginInput(req.body);
    const result = await loginUser({ email, password });

    res.status(200).json({ message: "User logged in successfully", data: result });
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Login failed", data: null });
  }
};

/**
 * POST /api/v1/auth/logout
 * Logout the currently authenticated user.
 * Since JWT is stateless, we simply respond with a success message.
 * The client is responsible for discarding the token.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // If the client provided an Authorization header, revoke that token.
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        // Try to read the token's expiry from the decoded payload so we can
        // store an appropriate `expiresAt` value for cleanup.
        const decoded: any = (await import("../utils/jwt.utils")).verifyToken(token);
        const exp = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
        await revokeToken(token, exp);
      }
    }

    // In all cases respond with success. Clients should also remove tokens
    // from local storage/cookies to fully log out on the client side.
    res.status(200).json({ message: "User logged out successfully", data: null });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to logout", data: null });
  }
};
