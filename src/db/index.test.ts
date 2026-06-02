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

const { db } = await import("./index");

describe("db", () => {
  it("creates a drizzle database using a mysql pool", () => {
    expect(createPoolMock).toHaveBeenCalled();
    expect(drizzleMock).toHaveBeenCalled();
    expect(db).toEqual({
      connection: { pool: true },
      options: expect.objectContaining({ mode: "default" }),
    });
  });
});
