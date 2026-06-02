import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

/**
 * POST /api/v1/auth/register
 * Register a new user using form-data fields: name, email, password
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required", data: null });
      return;
    }

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
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required", data: null });
      return;
    }

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
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "User logged out successfully", data: null });
};
