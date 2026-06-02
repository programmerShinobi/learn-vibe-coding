import { describe, expect, it } from "bun:test";
import { dbConfig } from "./db.config";

describe("dbConfig", () => {
  it("provides a database url", () => {
    expect(dbConfig.url).toBeString();
    expect(dbConfig.url.length).toBeGreaterThan(0);
  });
});
