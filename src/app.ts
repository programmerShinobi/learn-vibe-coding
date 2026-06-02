/*
  Express application setup

  This file wires middleware, route mounting, and common endpoints. Keep the
  middleware order intentional:
  1. CORS - configure allowed origins early to avoid preflight issues.
  2. Body parsers - `urlencoded` and `json` so controllers receive parsed data.
  3. Route mounting - mount API routers under `/api/v1`.
  4. Health check and fallback handlers.

  Controllers assume parsed request bodies and rely on the `authenticate`
  middleware (used within routers) to populate `req.user` for authenticated
  endpoints.
*/
import express from "express";
import cors from "cors";
import routes from "./routes";
import { corsConfig } from "./config/cors.config";

const app = express();

// Enable CORS. Use CORS_ORIGIN to restrict production origins.
app.use(cors(corsConfig));

// Parse application/x-www-form-urlencoded (form-data) request bodies
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies as well (for flexibility)
app.use(express.json());

// Mount all API routes under /api/v1
app.use("/api/v1", routes);

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({ message: "Notes API is running", data: null });
});

// Global 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found", data: null });
});

export default app;
