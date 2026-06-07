/*
  Tests for health controllers

  Verify the liveness endpoint reports the running status, and that readiness
  pings the database — returning 200 when reachable and 503 when not.
*/
import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import type { Request } from "express";
import { createMockResponse } from "../test-utils/http";

const pingDbMock = mock(async () => undefined);

mock.module("../../src/db", () => ({
  pingDb: pingDbMock,
}));

const { liveness, readiness } = await import("../../src/controllers/health.controller");

describe("health controller", () => {
  beforeEach(() => {
    pingDbMock.mockClear();
    pingDbMock.mockResolvedValue(undefined);
  });

  it("liveness reports the running status", () => {
    const res = createMockResponse();
    liveness({} as Request, res);

    expect(res.body).toEqual({ message: "Notes API is running", data: null });
  });

  it("readiness returns 200 when the database is reachable", async () => {
    const res = createMockResponse();
    await readiness({} as Request, res);

    expect(pingDbMock).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "ok", data: { database: "up" } });
  });

  it("readiness returns 503 when the database ping fails", async () => {
    const consoleSpy = spyOn(console, "error").mockImplementation(() => undefined);
    pingDbMock.mockRejectedValueOnce(new Error("connection refused"));
    const res = createMockResponse();

    await readiness({} as Request, res);

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ message: "Service unavailable", data: { database: "down" } });
    consoleSpy.mockRestore();
  });
});
