/*
  Database configuration

  This module centralizes the application's database connection settings.
  - It loads environment variables via `dotenv` so that `process.env` is populated
    when running locally (for example from a `.env` file).
  - `dbConfig.url` is the canonical connection URL used by the database client.
  - `DATABASE_URL` is required: the application fails fast when it is unset rather
    than falling back to baked-in default credentials (a security risk that can
    also silently connect to the wrong database). This mirrors the fail-fast
    handling of `JWT_SECRET`.

  Typical DATABASE_URL format (MySQL):
    mysql://user:password@host:port/database

  Consumers should import `dbConfig` and pass `dbConfig.url` to the DB client
  initialization routine.
*/
import dotenv from "dotenv";
dotenv.config();

const url = process.env.DATABASE_URL;

if (!url) {
  // Fail fast: avoid connecting with insecure default credentials in source.
  throw new Error("DATABASE_URL is required");
}

export const dbConfig = {
  // Connection string for the database. Set `DATABASE_URL` in the environment.
  url,
};
