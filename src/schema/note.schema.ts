/*
  Notes table schema (Drizzle ORM)

  Defines the `notes` table which contains user-created notes. Important
  fields and constraints:
  - `id`: primary auto-incrementing identifier.
  - `userId`: foreign key referencing `users.id` to enforce ownership.
  - `title`: short title limited to 255 characters.
  - `content`: free-form text content for the note.
  - `createdAt` / `updatedAt`: audit timestamps.

  The foreign key relationship ensures that notes are always associated with
  a valid user. Repositories use these definitions to construct type-safe
  queries.
*/
import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { users } from "./auth.schema";

export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
