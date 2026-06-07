/*
  Server entrypoint

  Responsible for starting the Express application. It reads configuration
  (port, NODE_ENV) from environment variables and prints a helpful colored
  banner on startup. Exported helpers allow programmatic control of server
  lifecycle for testing (e.g. starting/stopping the server from tests).

  Beyond starting the HTTP listener, this module:
  - Schedules a periodic cleanup of expired revoked-token rows so that table
    does not grow without bound.
  - Installs SIGTERM/SIGINT handlers for graceful shutdown: stop accepting new
    connections, clear the cleanup timer, and close the DB connection pool
    before exiting.
*/
import "dotenv/config";
import type { Server } from "node:http";
import app from "./app";
import { closeDb } from "./db";
import { deleteExpiredTokens } from "./repositories/token.repository";

// ANSI color codes for terminal styling
const RESET  = "\x1b[0m";
const CYAN   = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN  = "\x1b[32m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

// Read port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// How often to purge expired revoked-token rows (default: hourly).
const TOKEN_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Prints a styled ASCII banner to the terminal when the server starts.
 * Uses ANSI escape codes for colors — no extra dependencies required.
 */
export const printBanner = (port: number | string) => {
  console.log(`
${CYAN}${BOLD}  ███╗   ██╗ ██████╗ ████████╗███████╗███████╗
  ████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝
  ██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗
  ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║
  ██║ ╚████║╚██████╔╝   ██║   ███████╗███████║
  ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝${RESET}
${YELLOW}${BOLD}            A P I   S E R V E R${RESET}
${DIM}  ─────────────────────────────────────────────${RESET}
  ${GREEN}▶  Status   ${RESET}: Running
  ${GREEN}▶  Port     ${RESET}: ${BOLD}http://localhost:${port}${RESET}
  ${GREEN}▶  Docs     ${RESET}: http://localhost:${port}/api/v1
  ${GREEN}▶  Mode     ${RESET}: ${process.env.NODE_ENV || "development"}
${DIM}  ─────────────────────────────────────────────${RESET}
  `);
};

/**
 * Start the periodic cleanup of expired revoked tokens. The timer is `unref`'d
 * so it never keeps the process alive on its own. Returns the timer handle so
 * the caller can clear it during shutdown.
 */
export const startTokenCleanup = (intervalMs = TOKEN_CLEANUP_INTERVAL_MS) => {
  const timer = setInterval(() => {
    deleteExpiredTokens().catch((error) => {
      console.error("token cleanup failed:", error);
    });
  }, intervalMs);
  timer.unref?.();
  return timer;
};

/**
 * Register SIGTERM/SIGINT handlers that shut the process down gracefully:
 * stop the cleanup timer, stop accepting connections, then close the DB pool.
 */
export const registerGracefulShutdown = (server: Server, cleanupTimer: ReturnType<typeof setInterval>) => {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\nReceived ${signal}, shutting down gracefully...`);

    clearInterval(cleanupTimer);

    // Stop accepting new connections and wait for in-flight requests to finish.
    await new Promise<void>((resolve) => server.close(() => resolve()));

    try {
      await closeDb();
    } catch (error) {
      console.error("error while closing database pool:", error);
    }

    process.exit(0);
  };

  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
};

export const startServer = () => {
  const server = app.listen(PORT, () => {
    printBanner(PORT);
  });

  const cleanupTimer = startTokenCleanup();
  registerGracefulShutdown(server, cleanupTimer);

  return server;
};

if (import.meta.main) {
  startServer();
}
