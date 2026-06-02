/*
  Test utilities: HTTP response mock

  `createMockResponse` returns a lightweight mock object that mimics the
  essential `express.Response` interface required by controller unit tests.

  The mock captures:
  - `statusCode`: the numeric HTTP status set by handlers via `res.status()`.
  - `body`: payload provided via `res.json()` so tests can assert response data.

  The returned object is cast to `Response & { statusCode: number; body: unknown }`
  to make it convenient to use in tests while keeping implementation intentionally
  small and dependency-free.
*/
import type { Response } from "express";

export const createMockResponse = () => {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return res as unknown as Response & { statusCode: number; body: unknown };
};
