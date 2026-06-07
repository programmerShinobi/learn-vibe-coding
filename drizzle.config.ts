import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

const url = process.env.DATABASE_URL;

if (!url) {
  // Fail fast rather than embedding default credentials in source.
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  dialect: "mysql",
  schema: ["./src/schema/auth.schema.ts", "./src/schema/note.schema.ts", "./src/schema/token.schema.ts"],
  out: "./drizzle",
  dbCredentials: {
    url,
  },
});
