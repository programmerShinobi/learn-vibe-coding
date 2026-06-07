/*
  Express application setup

  This file wires middleware, route mounting, and common endpoints. Keep the
  middleware order intentional:
  1. helmet - set standard security headers as early as possible.
  2. CORS - configure allowed origins early to avoid preflight issues.
  3. Request logging - log every request (skipped under test).
  4. Body parsers - `urlencoded` and `json` (with size limits) so controllers
     receive parsed data.
  5. Route mounting - mount API routers under `/api/v1`.
  6. Health checks (liveness `/`, readiness `/health`).
  7. 404 handler, then the centralized error-handling middleware LAST.

  Controllers assume parsed request bodies and rely on the `authenticate`
  middleware (used within routers) to populate `req.user` for authenticated
  endpoints. Controllers throw typed errors; Express 5 forwards them to the
  centralized `errorHandler`.
*/
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { corsConfig } from "./config/cors.config";
import { liveness, readiness } from "./controllers/health.controller";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

// Cap request body size to mitigate large-payload denial-of-service attempts.
const BODY_LIMIT = "100kb";

const app = express();

// Set well-known security headers (HSTS, X-Content-Type-Options, etc.).
app.use(helmet());

// Enable CORS. Use CORS_ORIGIN to restrict production origins.
app.use(cors(corsConfig));

// Log HTTP requests for runtime visibility. Skip in tests to keep output clean.
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Parse application/x-www-form-urlencoded (form-data) request bodies
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

// Parse JSON bodies as well (for flexibility)
app.use(express.json({ limit: BODY_LIMIT }));

// Mount all API routes under /api/v1
app.use("/api/v1", routes);

// Health checks: liveness (process up) and readiness (dependencies reachable).
app.get("/", liveness);
app.get("/health", readiness);

// Global 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error-handling middleware. MUST be registered last so it can
// catch errors propagated from any route or middleware above.
app.use(errorHandler);

export default app;
