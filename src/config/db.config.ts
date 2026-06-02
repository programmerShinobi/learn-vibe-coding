import dotenv from "dotenv";
dotenv.config();

export const dbConfig = {
  url: process.env.DATABASE_URL || "mysql://root:mysql@localhost:3306/vibe_db",
};
