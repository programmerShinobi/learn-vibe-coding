/*
  Authentication middleware

  This middleware protects routes by validating a Bearer JWT provided in the
  `Authorization` header. Behavior summary:
  - Checks the presence and format of `Authorization: Bearer <token>`.
  - Verifies the token using `verifyToken` from the JWT utilities.
  - Narrows the decoded value to the expected `AuthTokenPayload` shape and,
    on success, attaches `req.user` so downstream handlers can access the
    authenticated user's `id` and `email` without extra DB lookups.
  - In all failure cases it responds with a 401 JSON payload and does not call
    `next()`, implementing fail-fast authentication.

  Notes on global augmentation:
  - The module augments `Express.Request` with an optional `user` property so
    TypeScript-aware handlers can read `req.user` safely after this middleware
    runs. This is a local, strictly-typed augmentation to reduce repetitive
    casting in controllers.
*/
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import type { AuthTokenPayload } from "../utils/jwt.utils";

const isAuthTokenPayload = (payload: unknown): payload is AuthTokenPayload => {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Partial<AuthTokenPayload>;
  return typeof candidate.id === "number" && typeof candidate.email === "string";
};

declare global {
  namespace Express {
    interface Request {
      // Optional property populated by the `authenticate` middleware on success.
      user?: AuthTokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Unauthorized: Token missing or invalid",
        data: null
      });
      return;
    }

    // Split "Bearer <token>" and extract the token part
    const token = authHeader.split(" ")[1];

    // Guard: token must exist after splitting (handles malformed headers)
    if (!token) {
      res.status(401).json({
        message: "Unauthorized: Token missing or invalid",
        data: null
      });
      return;
    }

    const decoded = verifyToken(token);
    if (!isAuthTokenPayload(decoded)) {
      res.status(401).json({
        message: "Unauthorized: Token missing or invalid",
        data: null
      });
      return;
    }
    
    // Attach the validated user payload to the request for downstream handlers.
    req.user = decoded;
    next();
  } catch (error) {
    // Any verification error results in a 401 response to the client.
    res.status(401).json({
      message: "Unauthorized: Token missing or invalid",
      data: null
    });
  }
};
