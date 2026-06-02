import { beforeEach, describe, expect, it, mock } from "bun:test";

const limitMock = mock(async (_limit: number) => [{ id: 1, email: "user@example.com" }]);
const whereMock = mock((_condition: unknown) => ({ limit: limitMock }));
const fromMock = mock((_table: unknown) => ({ where: whereMock }));
const selectMock = mock(() => ({ from: fromMock }));
const valuesMock = mock(async (_data: unknown) => [{ insertId: 1 }]);
const insertMock = mock((_table: unknown) => ({ values: valuesMock }));

mock.module("../db", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
  },
}));

const repo = await import("./auth.repository");

describe("auth repository", () => {
  beforeEach(() => {
    selectMock.mockClear();
    insertMock.mockClear();
    valuesMock.mockClear();
    limitMock.mockResolvedValue([{ id: 1, email: "user@example.com" }]);
  });

  it("finds a user by email", async () => {
    await expect(repo.findUserByEmail("user@example.com")).resolves.toEqual({ id: 1, email: "user@example.com" });
    expect(selectMock).toHaveBeenCalled();
  });

  it("creates a user and returns the inserted row", async () => {
    const userData = { name: "User", email: "user@example.com", password: "secret" };

    await expect(repo.createUser(userData)).resolves.toEqual({ id: 1, email: "user@example.com" });

    expect(insertMock).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith(userData);
  });
});
