import { mysqlTable, serial, varchar, timestamp } from "drizzle-orm/mysql-core";

/**
 * Database Schema Definition
 * 
 * Here we define our MySQL tables using Drizzle's MySQL core schema helpers.
 * These typescript definitions are used to ensure type safety in our queries
 * and to automatically generate SQL migrations via drizzle-kit.
 */

// Define the 'users' table in MySQL
export const users = mysqlTable("users", {
  // Primary key column, auto-incrementing serial integer
  id: serial("id").primaryKey(),
  
  // Name column, variable character field (max length 255), cannot be null
  name: varchar("name", { length: 255 }).notNull(),
  
  // Email column, variable character field (max length 255), cannot be null, must be unique
  email: varchar("email", { length: 255 }).notNull().unique(),
  
  // Timestamp column representing when the record was created, defaults to CURRENT_TIMESTAMP
  createdAt: timestamp("created_at").defaultNow(),
});
