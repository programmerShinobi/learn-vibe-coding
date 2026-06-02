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
