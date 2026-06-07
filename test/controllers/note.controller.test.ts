/*
  Unit tests for note controllers

  These tests mock the service layer to verify controller input validation,
  authentication usage, and response mapping for CRUD operations.
*/
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Request } from "express";
import { createMockResponse } from "../test-utils/http";
import { ForbiddenError, NotFoundError, ValidationError } from "../../src/errors";

const createNoteMock = mock(async (noteData: any) => ({ id: 1, ...noteData }));
const getAllNotesMock = mock(async (userId: number) => [{ id: 1, userId }]);
const getNoteByIdMock = mock(async (id: number, userId: number) => ({ id, userId, title: "Title" }));
const getNotesByUserIdMock = mock(async (userId: number) => [{ id: 1, userId }]);
const updateNoteMock = mock(async (id: number, userId: number, noteData: any) => ({ id, userId, ...noteData }));
const deleteNoteMock = mock(async (_id: number, _userId: number) => undefined);

mock.module("../../src/services/note.service", () => ({
  createNote: createNoteMock,
  getAllNotes: getAllNotesMock,
  getNoteById: getNoteByIdMock,
  getNotesByUserId: getNotesByUserIdMock,
  updateNote: updateNoteMock,
  deleteNote: deleteNoteMock,
}));

const controller = await import("../../src/controllers/note.controller");

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

  it("rejects missing note fields and invalid ids by throwing 400 errors", async () => {
    // Controllers no longer catch errors; they throw typed errors that the
    // centralized error middleware maps to HTTP responses.
    const createPromise = controller.createNote({ body: {}, user: { id: 7 } } as Request, createMockResponse());
    await expect(createPromise).rejects.toBeInstanceOf(ValidationError);

    const getPromise = controller.getNoteById({ params: { id: "abc" }, user: { id: 7 } } as unknown as Request, createMockResponse());
    await expect(getPromise).rejects.toMatchObject({ statusCode: 400 });
  });

  it("returns notes by common query paths", async () => {
    const allRes = createMockResponse();
    await controller.getAllNotes({ user: { id: 7 } } as Request, allRes);
    expect(getAllNotesMock).toHaveBeenCalledWith(7);
    expect(allRes.body).toEqual({ message: "Notes retrieved successfully", data: [{ id: 1, userId: 7 }] });

    const oneRes = createMockResponse();
    await controller.getNoteById({ params: { id: "1" }, user: { id: 7 } } as unknown as Request, oneRes);
    expect(getNoteByIdMock).toHaveBeenCalledWith(1, 7);
    expect(oneRes.statusCode).toBe(200);

    const userRes = createMockResponse();
    await controller.getNotesByUserId({ params: { userId: "7" }, user: { id: 7 } } as unknown as Request, userRes);
    expect(getNotesByUserIdMock).toHaveBeenCalledWith(7);
  });

  it("rejects access to another user's notes", async () => {
    const promise = controller.getNotesByUserId(
      { params: { userId: "8" }, user: { id: 7 } } as unknown as Request,
      createMockResponse()
    );

    await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
    expect(getNotesByUserIdMock).not.toHaveBeenCalled();
  });

  it("updates and deletes notes", async () => {
    const updateRes = createMockResponse();
    await controller.updateNote({ params: { id: "1" }, body: { title: "New" }, user: { id: 7 } } as unknown as Request, updateRes);
    expect(updateNoteMock).toHaveBeenCalledWith(1, 7, { title: "New" });
    expect(updateRes.statusCode).toBe(200);

    const deleteRes = createMockResponse();
    await controller.deleteNote({ params: { id: "1" }, user: { id: 7 } } as unknown as Request, deleteRes);
    expect(deleteNoteMock).toHaveBeenCalledWith(1, 7);
    expect(deleteRes.statusCode).toBe(200);
  });

  it("propagates not-found service errors (mapped to 404 by the error middleware)", async () => {
    getNoteByIdMock.mockRejectedValueOnce(new NotFoundError("Note not found"));

    const promise = controller.getNoteById(
      { params: { id: "99" }, user: { id: 7 } } as unknown as Request,
      createMockResponse()
    );

    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
  });
});
