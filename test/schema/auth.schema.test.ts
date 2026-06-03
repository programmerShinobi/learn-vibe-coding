/*
  Tests for users schema

  Validate that the `users` Drizzle schema exposes the expected column names
  used by repositories and services.
*/
import { describe, expect, it } from "bun:test";
import { users } from "../../src/schema/auth.schema";

describe("users schema", () => {
  it("defines the users table columns", () => {
    expect(users.id.name).toBe("id");
    expect(users.name.name).toBe("name");
    expect(users.email.name).toBe("email");
    expect(users.password.name).toBe("password");
    expect(users.createdAt.name).toBe("created_at");
    expect(users.updatedAt.name).toBe("updated_at");
  });
});
