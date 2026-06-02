import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * Database Connection & Drizzle Initialization
 * 
 * This file establishes a connection pool to our MySQL database using mysql2/promise.
 * It then initializes the Drizzle ORM client using that connection pool and our schema,
 * allowing us to perform type-safe SQL queries.
 */

// Retrieve the database connection URL from environmental variables (.env)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined!");
}

// Create a connection pool to the MySQL database.
// Using pools is a best practice to manage and reuse connections efficiently.
export const poolConnection = mysql.createPool({
  uri: connectionString,
});

// Initialize and export the Drizzle ORM database client.
// Passing the schema config allows us to use relational queries if needed.
export const db = drizzle(poolConnection, { schema, mode: "default" });
