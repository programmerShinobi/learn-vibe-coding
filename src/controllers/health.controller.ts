/*
  Health controllers

  - `liveness` (`GET /`): a cheap check that the process is up and serving.
  - `readiness` (`GET /health`): verifies the app can actually serve traffic by
    pinging the database. Returns 503 when a dependency is unavailable so
    orchestrators (Docker, k8s, load balancers) can route around the instance.
*/
import type { Request, Response } from "express";
import { pingDb } from "../db";

/** GET / — liveness: the server is running. */
export const liveness = (_req: Request, res: Response): void => {
  res.json({ message: "Notes API is running", data: null });
};

/** GET /health — readiness: dependencies (the database) are reachable. */
export const readiness = async (_req: Request, res: Response): Promise<void> => {
  try {
    await pingDb();
    res.status(200).json({ message: "ok", data: { database: "up" } });
  } catch (error) {
    // A failed readiness check is expected to be transient; log and report 503.
    console.error("health.readiness: database ping failed:", error);
    res.status(503).json({ message: "Service unavailable", data: { database: "down" } });
  }
};
