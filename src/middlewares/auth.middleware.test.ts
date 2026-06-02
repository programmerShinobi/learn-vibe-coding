/*
  Tests for authentication middleware

  Verify that the `authenticate` middleware correctly handles valid Bearer
  tokens, attaches decoded payloads to `req.user`, and rejects requests when
  the token is missing or malformed.
*/
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { NextFunction, Request } from "express";
import { createMockResponse } from "../test-utils/http";

const verifyTokenMock = mock(() => ({ id: 1, email: "user@example.com" }));

mock.module("../utils/jwt.utils", () => ({
  verifyToken: verifyTokenMock,
}));

const { authenticate } = await import("./auth.middleware");

describe("authenticate", () => {
  beforeEach(() => {
    verifyTokenMock.mockReset();
    verifyTokenMock.mockReturnValue({ id: 1, email: "user@example.com" });
  });

  it("attaches decoded user and calls next for a bearer token", () => {
    const req = { headers: { authorization: "Bearer token" } } as Request;
    const res = createMockResponse();
    const next = mock(() => undefined) as NextFunction;

    authenticate(req, res, next);

    expect(verifyTokenMock).toHaveBeenCalledWith("token");
    expect(req.user).toEqual({ id: 1, email: "user@example.com" });
    expect(next).toHaveBeenCalled();
  });

  it("rejects missing token", () => {
    const req = { headers: {} } as Request;
    const res = createMockResponse();
    const next = mock(() => undefined) as NextFunction;

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Unauthorized: Token missing or invalid", data: null });
    expect(next).not.toHaveBeenCalled();
  });
});
