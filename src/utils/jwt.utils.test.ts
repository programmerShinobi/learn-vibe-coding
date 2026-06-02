import { describe, expect, it } from "bun:test";
import { generateToken, verifyToken } from "./jwt.utils";

describe("jwt utils", () => {
  it("generates and verifies a token payload", () => {
    const token = generateToken({ id: 1, email: "user@example.com" });
    const decoded = verifyToken(token) as { id: number; email: string };

    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe("user@example.com");
  });
});
