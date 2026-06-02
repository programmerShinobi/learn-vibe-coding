import { describe, expect, it } from "bun:test";
import { jwtConfig } from "./jwt.config";

describe("jwtConfig", () => {
  it("provides a secret and expiration", () => {
    expect(jwtConfig.secret).toBeString();
    expect(jwtConfig.secret.length).toBeGreaterThan(0);
    expect(jwtConfig.expiresIn).toBe("1d");
  });
});
