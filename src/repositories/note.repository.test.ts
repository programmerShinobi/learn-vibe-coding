import { beforeEach, describe, expect, it, mock } from "bun:test";

const limitMock = mock(async (_limit: number) => [{ id: 1, title: "Title" }]);
const whereAfterSelectMock = mock((_condition: unknown) => ({ limit: limitMock }));
const whereDirectMock = mock(async (_condition: unknown) => [{ id: 1, userId: 7 }]);
const fromMock = mock((_table: unknown) => ({ where: whereAfterSelectMock }));
const selectMock = mock(() => ({ from: fromMock }));
const valuesMock = mock(async (_data: unknown) => [{ insertId: 1 }]);
const insertMock = mock((_table: unknown) => ({ values: valuesMock }));
const updateWhereMock = mock(async (_condition: unknown) => undefined);
const setMock = mock((_data: unknown) => ({ where: updateWhereMock }));
const updateMock = mock((_table: unknown) => ({ set: setMock }));
const deleteWhereMock = mock(async (_condition: unknown) => undefined);
const deleteMock = mock((_table: unknown) => ({ where: deleteWhereMock }));

mock.module("../db", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  },
}));

const repo = await import("./note.repository");

describe("note repository", () => {
  beforeEach(() => {
    selectMock.mockClear();
    insertMock.mockClear();
    valuesMock.mockClear();
    updateMock.mockClear();
    setMock.mockClear();
    deleteMock.mockClear();
    fromMock.mockImplementation((_table: unknown) => ({ where: whereAfterSelectMock }));
    limitMock.mockResolvedValue([{ id: 1, title: "Title" }]);
  });

  it("creates and fetches notes", async () => {
    await expect(repo.createNote({ userId: 7, title: "Title", content: "Body" })).resolves.toEqual({ id: 1, title: "Title" });
    await expect(repo.getNoteById(1)).resolves.toEqual({ id: 1, title: "Title" });
  });

  it("lists all notes and notes by user id", async () => {
    fromMock.mockReturnValueOnce([{ id: 1 }]);
    await expect(repo.getAllNotes()).resolves.toEqual([{ id: 1 }]);

    fromMock.mockReturnValueOnce({ where: whereDirectMock });
    await expect(repo.getNotesByUserId(7)).resolves.toEqual([{ id: 1, userId: 7 }]);
  });

  it("updates and deletes a note", async () => {
    await expect(repo.updateNote(1, { title: "New" })).resolves.toEqual({ id: 1, title: "Title" });
    await repo.deleteNote(1);

    expect(updateMock).toHaveBeenCalled();
    expect(setMock).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalled();
  });
});
