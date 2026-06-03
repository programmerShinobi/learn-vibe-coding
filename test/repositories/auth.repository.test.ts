/*
  Tests for auth repository

  Verify low-level persistence helpers for the `users` table. The tests mock
  the `db` object so they remain deterministic and fast.
*/
import { beforeEach, describe, expect, it, mock } from "bun:test";

const userRow = {
  id: 1,
  name: "User",
  email: "user@example.com",
  password: "hashed-password",
  createdAt: new Date("2026-06-02T00:00:00.000Z"),
  updatedAt: new Date("2026-06-02T00:00:00.000Z"),
};

const limitMock = mock(async (_limit: number) => [userRow]);
const whereMock = mock((_condition: unknown) => ({ limit: limitMock }));
const fromMock = mock((_table: unknown) => ({ where: whereMock }));
const selectMock = mock(() => ({ from: fromMock }));
const valuesMock = mock(async (_data: unknown) => [{ insertId: 1 }]);
const insertMock = mock((_table: unknown) => ({ values: valuesMock }));

mock.module("../../src/db", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
  },
}));

const repo = await import("../../src/repositories/auth.repository");

describe("auth repository", () => {
  beforeEach(() => {
    selectMock.mockClear();
    insertMock.mockClear();
    valuesMock.mockClear();
    limitMock.mockResolvedValue([userRow]);
  });

  it("finds a user by email", async () => {
    await expect(repo.findUserByEmail("user@example.com")).resolves.toEqual(userRow);
    expect(selectMock).toHaveBeenCalled();
  });

  it("creates a user and returns the inserted row", async () => {
    const userData = { name: "User", email: "user@example.com", password: "secret" };

    await expect(repo.createUser(userData)).resolves.toEqual(userRow);

    expect(insertMock).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith(userData);
  });
});
