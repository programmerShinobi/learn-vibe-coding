import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Public routes - no authentication required
router.post("/register", register);
router.post("/login", login);

// Protected route - requires a valid JWT token
router.post("/logout", authenticate, logout);

export default router;
