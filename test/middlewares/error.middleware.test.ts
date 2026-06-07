/*
  Tests for the centralized error-handling middleware

  Verify that known `AppError` subclasses are mapped to their `statusCode` and
  message, that unexpected errors become a generic 500 (and are logged), and
  that `notFoundHandler` returns a 404.
*/
import { describe, expect, it, mock, spyOn } from "bun:test";
import type { NextFunction, Request } from "express";
import { createMockResponse } from "../test-utils/http";
import { errorHandler, notFoundHandler } from "../../src/middlewares/error.middleware";
import { ConflictError, NotFoundError, ValidationError } from "../../src/errors";

const noopNext = mock(() => undefined) as unknown as NextFunction;

describe("notFoundHandler", () => {
  it("responds with a 404 payload", () => {
    const res = createMockResponse();
    notFoundHandler({} as Request, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Route not found", data: null });
  });
});

describe("errorHandler", () => {
  it("maps AppError subclasses to their status code and message", () => {
    const cases = [
      { error: new ValidationError("bad input"), status: 400 },
      { error: new NotFoundError("missing"), status: 404 },
      { error: new ConflictError("exists"), status: 409 },
    ];

    for (const { error, status } of cases) {
      const res = createMockResponse();
      errorHandler(error, {} as Request, res, noopNext);
      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual({ message: error.message, data: null });
    }
  });

  it("maps unknown errors to a generic 500 and logs them", () => {
    const consoleSpy = spyOn(console, "error").mockImplementation(() => undefined);
    const res = createMockResponse();

    errorHandler(new Error("boom"), {} as Request, res, noopNext);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: "Internal server error", data: null });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
