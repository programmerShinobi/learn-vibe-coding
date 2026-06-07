/*
  Centralized error-handling middleware

  Express 5 automatically forwards rejected promises from async route handlers
  to error-handling middleware, so controllers no longer need per-handler
  try/catch blocks. This module provides:

  - `notFoundHandler`: a terminal handler for unmatched routes (404).
  - `errorHandler`: the single place that maps a thrown error to an HTTP
    response. Known `AppError` instances carry their own `statusCode`; any other
    error is treated as an unexpected 500 and logged with its stack.

  Responses keep the application-wide shape: `{ message: string, data: null }`.
*/
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

/** Terminal handler for requests that matched no route. */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: "Route not found", data: null });
};

/**
 * Express error-handling middleware. Must keep the four-argument signature so
 * Express recognizes it as an error handler, and must be registered last.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // `next` is required for Express to treat this as an error handler, even
  // though we always terminate the request here.
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, data: null });
    return;
  }

  // Unexpected error: log full details server-side, expose a generic message.
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error", data: null });
};
