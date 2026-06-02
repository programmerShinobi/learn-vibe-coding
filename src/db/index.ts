import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { dbConfig } from "../config/db.config";

import * as authSchema from "../schema/auth.schema";
import * as noteSchema from "../schema/note.schema";

const poolConnection = mysql.createPool({
  uri: dbConfig.url,
});

export const db = drizzle(poolConnection, { schema: { ...authSchema, ...noteSchema }, mode: "default" });
