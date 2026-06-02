/*
  Tests for note routes

  Ensure route wiring and middleware usage are correct. These tests inspect
  the Express router stack to verify handlers and middleware are mounted as
  intended without starting an HTTP server.
*/
import { describe, expect, it, mock } from "bun:test";

const authenticateMock = mock((req, _res, next) => {
  req.user = { id: 7 };
  next();
});
const createNoteMock = mock((_req, res) => res.status(201).json({ route: "create" }));
const getAllNotesMock = mock((_req, res) => res.json({ route: "all" }));
const getNoteByIdMock = mock((_req, res) => res.json({ route: "one" }));
const getNotesByUserIdMock = mock((_req, res) => res.json({ route: "user" }));
const updateNoteMock = mock((_req, res) => res.json({ route: "update" }));
const deleteNoteMock = mock((_req, res) => res.json({ route: "delete" }));

mock.module("../middlewares/auth.middleware", () => ({
  authenticate: authenticateMock,
}));

mock.module("../controllers/note.controller", () => ({
  createNote: createNoteMock,
  getAllNotes: getAllNotesMock,
  getNoteById: getNoteByIdMock,
  getNotesByUserId: getNotesByUserIdMock,
  updateNote: updateNoteMock,
  deleteNote: deleteNoteMock,
}));

const noteRoutes = (await import("./note.routes")).default;

describe("note routes", () => {
  it("wires protected note CRUD endpoints", async () => {
    const stack = noteRoutes.stack as any[];
    const routes = stack.map((layer: any) => ({
      name: layer.name,
      path: layer.route?.path,
      methods: layer.route?.methods,
      handlers: layer.route?.stack.map((routeLayer: any) => routeLayer.handle),
    }));
    const [, createRoute, allRoute, userRoute, oneRoute, updateRoute, deleteRoute] = routes as [any, any, any, any, any, any, any];

    expect(stack[0].handle).toBe(authenticateMock);
    expect(createRoute).toMatchObject({ path: "/", methods: { post: true } });
    expect(createRoute.handlers).toContain(createNoteMock);
    expect(allRoute).toMatchObject({ path: "/", methods: { get: true } });
    expect(allRoute.handlers).toContain(getAllNotesMock);
    expect(userRoute).toMatchObject({ path: "/user/:userId", methods: { get: true } });
    expect(userRoute.handlers).toContain(getNotesByUserIdMock);
    expect(oneRoute).toMatchObject({ path: "/:id", methods: { get: true } });
    expect(oneRoute.handlers).toContain(getNoteByIdMock);
    expect(updateRoute).toMatchObject({ path: "/:id", methods: { put: true } });
    expect(updateRoute.handlers).toContain(updateNoteMock);
    expect(deleteRoute).toMatchObject({ path: "/:id", methods: { delete: true } });
    expect(deleteRoute.handlers).toContain(deleteNoteMock);
  });
});
