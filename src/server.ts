/*
  Server entrypoint

  Responsible for starting the Express application. It reads configuration
  (port, NODE_ENV) from environment variables and prints a helpful colored
  banner on startup. Exported helpers allow programmatic control of server
  lifecycle for testing (e.g. starting/stopping the server from tests).
*/
import "dotenv/config";
import app from "./app";

// ANSI color codes for terminal styling
const RESET  = "\x1b[0m";
const CYAN   = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN  = "\x1b[32m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

// Read port from environment or default to 3000
const PORT = process.env.PORT || 3000;

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

export const startServer = () => {
  return app.listen(PORT, () => {
    printBanner(PORT);
  });
};

if (import.meta.main) {
  startServer();
}
