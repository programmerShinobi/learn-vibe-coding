import { Router } from "express";
import authRoutes from "./auth.routes";
import noteRoutes from "./note.routes";

const router = Router();

// Mount all route groups under versioned API prefix
router.use("/auth", authRoutes);   // /api/v1/auth/*
router.use("/notes", noteRoutes);  // /api/v1/notes/*

export default router;
