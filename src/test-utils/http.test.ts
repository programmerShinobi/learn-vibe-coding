import { describe, expect, it } from "bun:test";
import { createMockResponse } from "./http";

describe("createMockResponse", () => {
  it("captures status and json payload like an express response", () => {
    const res = createMockResponse();

    const returned = res.status(201).json({ ok: true });

    expect(returned).toBe(res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: true });
  });
});
