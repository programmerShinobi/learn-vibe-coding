/*
  Tests for database initialization

  Ensure that the Drizzle ORM instance is created using a MySQL pool. Tests
  mock external database libraries to avoid creating real connections.
*/
import { describe, expect, it, mock } from "bun:test";

const createPoolMock = mock((_options: unknown) => ({ pool: true }));
const drizzleMock = mock((_connection: unknown, options: unknown) => ({ connection: _connection, options }));

mock.module("mysql2/promise", () => ({
  default: {
    createPool: createPoolMock,
  },
}));

mock.module("drizzle-orm/mysql2", () => ({
  drizzle: drizzleMock,
}));

const { db } = await import("../../src/db/index");

describe("db", () => {
  it("creates a drizzle database using a mysql pool", () => {
    expect(createPoolMock).toHaveBeenCalled();
    expect(drizzleMock).toHaveBeenCalled();
    expect(db as unknown).toEqual({
      connection: { pool: true },
      options: expect.objectContaining({ mode: "default" }),
    });
  });
});
