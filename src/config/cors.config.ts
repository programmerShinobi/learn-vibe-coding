/*
  CORS configuration

  Purpose:
  - Provide a configuration object for the CORS middleware used by the web server.
  - Support a flexible `CORS_ORIGIN` environment variable that can be empty,
    contain a single origin, or a comma-separated list of allowed origins.

  Behavior:
  - If `CORS_ORIGIN` is not set, `origin` is `true` which tells the CORS middleware
    to allow requests from any origin (useful for development).
  - If set, the value is split by commas, trimmed, and empty entries are removed.
    The resulting array is suitable for the `origin` option of common CORS libs.
*/
import dotenv from "dotenv";
dotenv.config();

const parseOrigins = (value: string | undefined) => {
  // If no value is provided, allow all origins (boolean `true`).
  if (!value) return true;
  // Convert a comma-separated list into an array of non-empty trimmed origins.
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const corsConfig = {
  // The `origin` key is used by CORS middleware to determine allowed origins.
  origin: parseOrigins(process.env.CORS_ORIGIN),
};
