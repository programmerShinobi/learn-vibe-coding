/*
  Tests for database error helpers

  Verify `isDuplicateKeyError` recognizes MySQL duplicate-key failures by both
  the string code and the numeric errno, and ignores unrelated errors.
*/
import { describe, expect, it } from "bun:test";
import { isDuplicateKeyError } from "../../src/repositories/db-errors";

describe("isDuplicateKeyError", () => {
  it("detects duplicate-key errors by code or errno", () => {
    expect(isDuplicateKeyError(Object.assign(new Error("dup"), { code: "ER_DUP_ENTRY" }))).toBe(true);
    expect(isDuplicateKeyError({ errno: 1062 })).toBe(true);
  });

  it("returns false for unrelated or non-object errors", () => {
    expect(isDuplicateKeyError(new Error("other"))).toBe(false);
    expect(isDuplicateKeyError({ code: "ER_NO_SUCH_TABLE" })).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
    expect(isDuplicateKeyError("ER_DUP_ENTRY")).toBe(false);
  });
});
