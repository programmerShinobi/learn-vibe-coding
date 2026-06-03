/*
  Tests for DB configuration

  Validate that `db.config` exports a non-empty `DATABASE_URL` or default
  connection string. These tests avoid network activity and only assert the
  configuration shape.
*/
import { describe, expect, it } from "bun:test";
import { dbConfig } from "../../src/config/db.config";

describe("dbConfig", () => {
  it("provides a database url", () => {
    expect(dbConfig.url).toBeString();
    expect(dbConfig.url.length).toBeGreaterThan(0);
  });
});
