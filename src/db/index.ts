/*
  Database initialization

  This module creates and exports a configured Drizzle ORM instance backed by
  a MySQL connection pool. Key points:
  - A `mysql2/promise` pool is created using the connection `uri` from
    `dbConfig` so the rest of the app can reuse connections efficiently.
  - Schemas are imported and composed into the `schema` option so Drizzle can
    generate typed query builders for the defined tables.
  - Exported `db` is the primary entrypoint for repositories to run queries.

  Usage:
    import { db } from "../db";
    await db.insert(someTable).values({...});
*/
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { dbConfig } from "../config/db.config";

import * as authSchema from "../schema/auth.schema";
import * as noteSchema from "../schema/note.schema";
import * as tokenSchema from "../schema/token.schema";

// Create a connection pool so the application can efficiently reuse MySQL connections.
const poolConnection = mysql.createPool({
  uri: dbConfig.url,
});

// Compose schemas and initialize Drizzle ORM.
// Include token schema for revoked token storage
export const db = drizzle(poolConnection, { schema: { ...authSchema, ...noteSchema, ...tokenSchema }, mode: "default" });

/**
 * Run a trivial query to confirm the database is reachable. Used by the
 * readiness health check. Throws if the connection is unavailable.
 */
export const pingDb = async (): Promise<void> => {
  await poolConnection.query("SELECT 1");
};

/**
 * Close the underlying MySQL connection pool. Called during graceful shutdown
 * so in-flight connections are released cleanly before the process exits.
 */
export const closeDb = async (): Promise<void> => {
  await poolConnection.end();
};
