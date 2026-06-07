/*
	Authentication routes

	Exposes endpoints under the `/api/v1/auth` path for registering, logging in,
	and logging out. The `logout` route is protected by the `authenticate`
	middleware because it represents an action performed by an authenticated
	user in the API contract, even though JWTs are stateless.
*/
import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

// Public routes - no authentication required. Rate limited to slow down
// brute-force / credential-stuffing attempts against these endpoints.
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);

// Protected route - requires a valid JWT token
router.post("/logout", authenticate, logout);

export default router;
