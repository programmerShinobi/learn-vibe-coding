/*
  Database configuration

  This module centralizes the application's database connection settings.
  - It loads environment variables via `dotenv` so that `process.env` is populated
    when running locally (for example from a `.env` file).
  - `dbConfig.url` is the canonical connection URL used by the database client.
  - A sensible default is provided to allow local development without extra setup,
    but production deployments must set `DATABASE_URL` for correct behavior.

  Typical DATABASE_URL format (MySQL):
    mysql://user:password@host:port/database

  Consumers should import `dbConfig` and pass `dbConfig.url` to the DB client
  initialization routine.
*/
import dotenv from "dotenv";
dotenv.config();

export const dbConfig = {
  // Connection string for the database. Prefer setting `DATABASE_URL` in env.
  url: process.env.DATABASE_URL || "mysql://root:mysql@localhost:3306/vibe_db",
};
