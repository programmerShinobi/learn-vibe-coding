import { describe, expect, it, mock } from "bun:test";
import express from "express";

mock.module("./auth.routes", () => ({
  default: express.Router().get("/ping", (_req, res) => res.json({ group: "auth" })),
}));

mock.module("./note.routes", () => ({
  default: express.Router().get("/ping", (_req, res) => res.json({ group: "notes" })),
}));

const routes = (await import("./index")).default;

describe("routes index", () => {
  it("mounts auth and note route groups", async () => {
    const [authLayer, noteLayer] = routes.stack as any[];

    expect(authLayer.match("/auth")).toBe(true);
    expect(authLayer.match("/notes")).toBe(false);
    expect(noteLayer.match("/notes")).toBe(true);
    expect(noteLayer.match("/auth")).toBe(false);
  });
});
