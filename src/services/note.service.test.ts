import { beforeEach, describe, expect, it, mock } from "bun:test";

const createNoteMock = mock(async (noteData: any) => ({ id: 1, ...noteData }));
const getNoteByIdMock = mock(async (_id: number) => ({ id: 1, title: "Title" }));
const getAllNotesMock = mock(async () => [{ id: 1 }]);
const getNotesByUserIdMock = mock(async (_userId: number) => [{ id: 1, userId: 7 }]);
const updateNoteMock = mock(async (id: number, noteData: any) => ({ id, ...noteData }));
const deleteNoteMock = mock(async (_id: number) => undefined);

mock.module("../repositories/note.repository", () => ({
  createNote: createNoteMock,
  getNoteById: getNoteByIdMock,
  getAllNotes: getAllNotesMock,
  getNotesByUserId: getNotesByUserIdMock,
  updateNote: updateNoteMock,
  deleteNote: deleteNoteMock,
}));

const noteService = await import("./note.service");

describe("note service", () => {
  beforeEach(() => {
    createNoteMock.mockClear();
    getNoteByIdMock.mockClear();
    getAllNotesMock.mockClear();
    getNotesByUserIdMock.mockClear();
    updateNoteMock.mockClear();
    deleteNoteMock.mockClear();
    getNoteByIdMock.mockResolvedValue({ id: 1, title: "Title" });
  });

  it("creates and lists notes through the repository", async () => {
    await expect(noteService.createNote({ userId: 7, title: "Title", content: "Body" })).resolves.toEqual({
      id: 1,
      userId: 7,
      title: "Title",
      content: "Body",
    });
    await expect(noteService.getAllNotes()).resolves.toEqual([{ id: 1 }]);
    await expect(noteService.getNotesByUserId(7)).resolves.toEqual([{ id: 1, userId: 7 }]);
  });

  it("throws when a note is not found", async () => {
    getNoteByIdMock.mockResolvedValue(undefined);

    await expect(noteService.getNoteById(99)).rejects.toThrow("Note not found");
    await expect(noteService.updateNote(99, { title: "New" })).rejects.toThrow("Note not found");
    await expect(noteService.deleteNote(99)).rejects.toThrow("Note not found");
  });

  it("updates and deletes existing notes", async () => {
    await expect(noteService.updateNote(1, { title: "New" })).resolves.toEqual({ id: 1, title: "New" });
    await noteService.deleteNote(1);

    expect(updateNoteMock).toHaveBeenCalledWith(1, { title: "New" });
    expect(deleteNoteMock).toHaveBeenCalledWith(1);
  });
});
