/*
  Tests for note service

  Ensure business rules around note retrieval, creation, update, and deletion
  are correctly implemented. The repository layer is mocked to isolate
  service behavior.
*/
import { beforeEach, describe, expect, it, mock } from "bun:test";

const noteRow = {
  id: 1,
  userId: 7,
  title: "Title",
  content: "Body",
  createdAt: new Date("2026-06-02T00:00:00.000Z"),
  updatedAt: new Date("2026-06-02T00:00:00.000Z"),
};

const createNoteMock = mock(async (noteData: any): Promise<any> => ({ ...noteRow, ...noteData }));
const getNoteByIdMock = mock(async (_id: number, _userId: number): Promise<any> => noteRow);
const getNotesByUserIdMock = mock(async (_userId: number): Promise<any> => [noteRow]);
const updateNoteMock = mock(async (id: number, userId: number, noteData: any): Promise<any> => ({ ...noteRow, id, userId, ...noteData }));
const deleteNoteMock = mock(async (_id: number, _userId: number) => undefined);

mock.module("../repositories/note.repository", () => ({
  createNote: createNoteMock,
  getNoteById: getNoteByIdMock,
  getNotesByUserId: getNotesByUserIdMock,
  updateNote: updateNoteMock,
  deleteNote: deleteNoteMock,
}));

const noteService = await import("./note.service");

describe("note service", () => {
  beforeEach(() => {
    createNoteMock.mockClear();
    getNoteByIdMock.mockClear();
    getNotesByUserIdMock.mockClear();
    updateNoteMock.mockClear();
    deleteNoteMock.mockClear();
    getNoteByIdMock.mockResolvedValue(noteRow);
  });

  it("creates and lists notes through the repository", async () => {
    await expect(noteService.createNote({ userId: 7, title: "Title", content: "Body" })).resolves.toEqual({
      id: 1,
      userId: 7,
      title: "Title",
      content: "Body",
      createdAt: noteRow.createdAt,
      updatedAt: noteRow.updatedAt,
    });
    await expect(noteService.getAllNotes(7)).resolves.toEqual([noteRow]);
    await expect(noteService.getNotesByUserId(7)).resolves.toEqual([noteRow]);
  });

  it("throws when a note is not found", async () => {
    getNoteByIdMock.mockResolvedValue(undefined);

    await expect(noteService.getNoteById(99, 7)).rejects.toThrow("Note not found");
    await expect(noteService.updateNote(99, 7, { title: "New" })).rejects.toThrow("Note not found");
    await expect(noteService.deleteNote(99, 7)).rejects.toThrow("Note not found");
  });

  it("updates and deletes existing notes", async () => {
    await expect(noteService.updateNote(1, 7, { title: "New" })).resolves.toEqual({ ...noteRow, title: "New" });
    await noteService.deleteNote(1, 7);

    expect(updateNoteMock).toHaveBeenCalledWith(1, 7, { title: "New" });
    expect(deleteNoteMock).toHaveBeenCalledWith(1, 7);
  });
});
