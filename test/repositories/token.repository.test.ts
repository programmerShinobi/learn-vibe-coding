/*
  Tests for token repository

  Verify that revoked tokens are stored and looked up by their SHA-256 hash
  (never as the raw JWT), and that expired rows can be purged.
*/
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createHash } from "node:crypto";

const insertedValues: Array<Record<string, unknown>> = [];
const selectRows: Array<Record<string, unknown>> = [];

const valuesMock = mock(async (data: Record<string, unknown>) => {
  insertedValues.push(data);
  return [{ insertId: 1 }];
});
const insertMock = mock((_table: unknown) => ({ values: valuesMock }));
const whereSelectMock = mock(async (_condition: unknown) => selectRows);
const fromMock = mock((_table: unknown) => ({ where: whereSelectMock }));
const selectMock = mock(() => ({ from: fromMock }));
const deleteWhereMock = mock(async (_condition: unknown) => undefined);
const deleteMock = mock((_table: unknown) => ({ where: deleteWhereMock }));

mock.module("../../src/db", () => ({
  db: {
    insert: insertMock,
    select: selectMock,
    delete: deleteMock,
  },
}));

const repo = await import("../../src/repositories/token.repository");

const TOKEN = "header.payload.signature";
const TOKEN_HASH = createHash("sha256").update(TOKEN).digest("hex");

describe("token repository", () => {
  beforeEach(() => {
    insertedValues.length = 0;
    selectRows.length = 0;
    valuesMock.mockClear();
    deleteMock.mockClear();
    deleteWhereMock.mockClear();
  });

  it("stores only the SHA-256 hash of the token, never the raw value", async () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    await repo.revokeToken(TOKEN, expiresAt);

    expect(insertedValues).toHaveLength(1);
    expect(insertedValues[0]).toEqual({ tokenHash: TOKEN_HASH, expiresAt });
    // The raw JWT must not appear anywhere in what we persist.
    expect(JSON.stringify(insertedValues[0])).not.toContain(TOKEN);
  });

  it("reports a token as revoked only when its hash is present", async () => {
    selectRows.push({ id: 1, tokenHash: TOKEN_HASH });
    await expect(repo.isTokenRevoked(TOKEN)).resolves.toBe(true);

    selectRows.length = 0;
    await expect(repo.isTokenRevoked(TOKEN)).resolves.toBe(false);
  });

  it("purges expired tokens", async () => {
    await repo.deleteExpiredTokens();
    expect(deleteMock).toHaveBeenCalled();
    expect(deleteWhereMock).toHaveBeenCalled();
  });
});
