import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

export default defineConfig({
  dialect: "mysql",
  schema: ["./src/schema/auth.schema.ts", "./src/schema/note.schema.ts", "./src/schema/token.schema.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL || "mysql://root:mysql@localhost:3306/vibe_db",
  },
});
