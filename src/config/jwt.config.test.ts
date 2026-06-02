/*
  Tests for JWT configuration

  Ensure the `JWT_SECRET` is present and has the expected default expiry
  configuration used by the authentication utilities. These tests rely on the
  environment in which the test runner runs.
*/
import { describe, expect, it } from "bun:test";
import { jwtConfig } from "./jwt.config";

describe("jwtConfig", () => {
  it("provides a secret and expiration", () => {
    expect(jwtConfig.secret).toBeString();
    expect(jwtConfig.secret.length).toBeGreaterThan(0);
    expect(jwtConfig.expiresIn).toBe("1d");
  });
});
