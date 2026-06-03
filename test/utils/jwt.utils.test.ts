/*
  Tests for JWT utilities

  Ensure tokens can be generated and verified. These tests assume a valid
  `JWT_SECRET` is available in the environment (see `src/config/jwt.config.ts`).
*/
import { describe, expect, it } from "bun:test";
import { generateToken, verifyToken } from "../../src/utils/jwt.utils";

describe("jwt utils", () => {
  it("generates and verifies a token payload", () => {
    const token = generateToken({ id: 1, email: "user@example.com" });
    const decoded = verifyToken(token) as { id: number; email: string };

    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe("user@example.com");
  });
});
