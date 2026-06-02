import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit Configuration File
 * 
 * This file is used by drizzle-kit CLI for managing migrations, generating SQL,
 * and pushing schema changes to your database.
 */
export default defineConfig({
  // The database dialect we are connecting to
  dialect: "mysql",
  
  // Path to our TypeScript database schema file(s)
  schema: "./src/db/schema.ts",
  
  // Output directory where migrations and SQL snapshots will be stored
  out: "./drizzle",
  
  // Database connection credentials, read from environment variables (.env)
  dbCredentials: {
    url: process.env.DATABASE_URL || "mysql://root:mysql@localhost:3306/vibe_db",
  },
});
