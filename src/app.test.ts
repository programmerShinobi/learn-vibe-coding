import { describe, expect, it } from "bun:test";
import app from "./app";
import { createMockResponse } from "./test-utils/http";

describe("app", () => {
  it("responds to the health check", async () => {
    const healthLayer = app.router.stack.find((layer: any) => layer.route?.path === "/");
    const handler = healthLayer.route.stack[0].handle;
    const res = createMockResponse();

    handler({}, res);

    expect(res.body).toEqual({ message: "Notes API is running", data: null });
  });

  it("mounts API routes and returns 404 for unmatched routes", async () => {
    const routeLayers = app.router.stack;
    const apiLayer = routeLayers.find((layer: any) => layer.name === "router");
    const notFoundLayer = routeLayers.at(-1);
    const res = createMockResponse();

    notFoundLayer.handle({}, res);

    expect(apiLayer.match("/api/v1")).toBe(true);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Route not found", data: null });
  });
});
