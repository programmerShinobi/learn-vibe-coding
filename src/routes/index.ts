/*
  Root router

  Aggregates all feature routers and mounts them under their respective path
  prefixes. This router is itself mounted at `/api/v1` in `src/app.ts`, so the
  effective base paths are:
  - `/api/v1/auth`  — authentication endpoints
  - `/api/v1/notes` — note CRUD endpoints
*/
import { Router } from "express";
import authRoutes from "./auth.routes";
import noteRoutes from "./note.routes";

const router = Router();

// Mount all route groups under versioned API prefix
router.use("/auth", authRoutes);   // /api/v1/auth/*
router.use("/notes", noteRoutes);  // /api/v1/notes/*

export default router;
