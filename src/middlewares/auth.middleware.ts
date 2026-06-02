import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";

declare global {
  namespace Express {
    interface Request {
      user?: any;
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
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized: Token missing or invalid",
      data: null
    });
  }
};
