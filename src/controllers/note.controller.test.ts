import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Request } from "express";
import { createMockResponse } from "../test-utils/http";

const createNoteMock = mock(async (noteData: any) => ({ id: 1, ...noteData }));
const getAllNotesMock = mock(async () => [{ id: 1 }]);
const getNoteByIdMock = mock(async (id: number) => ({ id, title: "Title" }));
const getNotesByUserIdMock = mock(async (userId: number) => [{ id: 1, userId }]);
const updateNoteMock = mock(async (id: number, noteData: any) => ({ id, ...noteData }));
const deleteNoteMock = mock(async (_id: number) => undefined);

mock.module("../services/note.service", () => ({
  createNote: createNoteMock,
  getAllNotes: getAllNotesMock,
  getNoteById: getNoteByIdMock,
  getNotesByUserId: getNotesByUserIdMock,
  updateNote: updateNoteMock,
  deleteNote: deleteNoteMock,
}));

const controller = await import("./note.controller");

describe("note controller", () => {
  beforeEach(() => {
    createNoteMock.mockClear();
    getAllNotesMock.mockClear();
    getNoteByIdMock.mockClear();
    getNotesByUserIdMock.mockClear();
    updateNoteMock.mockClear();
    deleteNoteMock.mockClear();
  });

  it("creates a note for the authenticated user", async () => {
    const req = { body: { title: "Title", content: "Body" }, user: { id: 7 } } as Request;
    const res = createMockResponse();

    await controller.createNote(req, res);

    expect(createNoteMock).toHaveBeenCalledWith({ userId: 7, title: "Title", content: "Body" });
    expect(res.statusCode).toBe(201);
  });

  it("rejects missing note fields and invalid ids", async () => {
    const createRes = createMockResponse();
    await controller.createNote({ body: {}, user: { id: 7 } } as Request, createRes);
    expect(createRes.statusCode).toBe(400);

    const getRes = createMockResponse();
    await controller.getNoteById({ params: { id: "abc" } } as unknown as Request, getRes);
    expect(getRes.statusCode).toBe(400);
  });

  it("returns notes by common query paths", async () => {
    const allRes = createMockResponse();
    await controller.getAllNotes({} as Request, allRes);
    expect(allRes.body).toEqual({ message: "Notes retrieved successfully", data: [{ id: 1 }] });

    const oneRes = createMockResponse();
    await controller.getNoteById({ params: { id: "1" } } as unknown as Request, oneRes);
    expect(getNoteByIdMock).toHaveBeenCalledWith(1);
    expect(oneRes.statusCode).toBe(200);

    const userRes = createMockResponse();
    await controller.getNotesByUserId({ params: { userId: "7" } } as unknown as Request, userRes);
    expect(getNotesByUserIdMock).toHaveBeenCalledWith(7);
  });

  it("updates and deletes notes", async () => {
    const updateRes = createMockResponse();
    await controller.updateNote({ params: { id: "1" }, body: { title: "New" } } as unknown as Request, updateRes);
    expect(updateNoteMock).toHaveBeenCalledWith(1, { title: "New", content: undefined });
    expect(updateRes.statusCode).toBe(200);

    const deleteRes = createMockResponse();
    await controller.deleteNote({ params: { id: "1" } } as unknown as Request, deleteRes);
    expect(deleteNoteMock).toHaveBeenCalledWith(1);
    expect(deleteRes.statusCode).toBe(200);
  });

  it("maps not found service errors to 404", async () => {
    getNoteByIdMock.mockRejectedValueOnce(new Error("Note not found"));
    const res = createMockResponse();

    await controller.getNoteById({ params: { id: "99" } } as unknown as Request, res);

    expect(res.statusCode).toBe(404);
  });
});
