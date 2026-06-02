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
    const routes = noteRoutes.stack.map((layer: any) => ({
      name: layer.name,
      path: layer.route?.path,
      methods: layer.route?.methods,
      handlers: layer.route?.stack.map((routeLayer: any) => routeLayer.handle),
    }));

    expect(noteRoutes.stack[0].handle).toBe(authenticateMock);
    expect(routes[1]).toMatchObject({ path: "/", methods: { post: true } });
    expect(routes[1].handlers).toContain(createNoteMock);
    expect(routes[2]).toMatchObject({ path: "/", methods: { get: true } });
    expect(routes[2].handlers).toContain(getAllNotesMock);
    expect(routes[3]).toMatchObject({ path: "/user/:userId", methods: { get: true } });
    expect(routes[3].handlers).toContain(getNotesByUserIdMock);
    expect(routes[4]).toMatchObject({ path: "/:id", methods: { get: true } });
    expect(routes[4].handlers).toContain(getNoteByIdMock);
    expect(routes[5]).toMatchObject({ path: "/:id", methods: { put: true } });
    expect(routes[5].handlers).toContain(updateNoteMock);
    expect(routes[6]).toMatchObject({ path: "/:id", methods: { delete: true } });
    expect(routes[6].handlers).toContain(deleteNoteMock);
  });
});
