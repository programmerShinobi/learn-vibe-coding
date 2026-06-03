/*
  Tests for the Express application wiring

  Verify health check, route mounting, and 404 handling without starting an
  HTTP server by introspecting the Express router stack.
*/
import { describe, expect, it } from "bun:test";
import app from "../src/app";
import { createMockResponse } from "./test-utils/http";

describe("app", () => {
  it("responds to the health check", async () => {
    const appWithRouter = app as any;
    const healthLayer = appWithRouter.router.stack.find((layer: any) => layer.route?.path === "/");
    const handler = healthLayer.route.stack[0].handle;
    const res = createMockResponse();

    handler({}, res, () => undefined);

    expect(res.body).toEqual({ message: "Notes API is running", data: null });
  });

  it("mounts API routes and returns 404 for unmatched routes", async () => {
    const appWithRouter = app as any;
    const routeLayers = appWithRouter.router.stack;
    const apiLayer = routeLayers.find((layer: any) => layer.name === "router");
    const notFoundLayer = routeLayers.at(-1);
    const res = createMockResponse();

    notFoundLayer.handle({}, res, () => undefined);

    expect(apiLayer.match("/api/v1")).toBe(true);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Route not found", data: null });
  });
});
