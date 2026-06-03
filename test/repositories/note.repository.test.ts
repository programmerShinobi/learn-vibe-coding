/*
  Tests for note repository

  These unit tests mock the `db` object to verify repository functions
  construct expected queries and return rows as intended.
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

const limitMock = mock(async (_limit: number) => [noteRow]);
const whereAfterSelectMock = mock((_condition: unknown) => ({ limit: limitMock }));
const whereDirectMock = mock(async (_condition: unknown) => [noteRow]);
const fromMock = mock((_table: unknown) => ({ where: whereAfterSelectMock }));
const selectMock = mock(() => ({ from: fromMock }));
const valuesMock = mock(async (_data: unknown) => [{ insertId: 1 }]);
const insertMock = mock((_table: unknown) => ({ values: valuesMock }));
const updateWhereMock = mock(async (_condition: unknown) => undefined);
const setMock = mock((_data: unknown) => ({ where: updateWhereMock }));
const updateMock = mock((_table: unknown) => ({ set: setMock }));
const deleteWhereMock = mock(async (_condition: unknown) => undefined);
const deleteMock = mock((_table: unknown) => ({ where: deleteWhereMock }));

mock.module("../../src/db", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  },
}));

const repo = await import("../../src/repositories/note.repository");

describe("note repository", () => {
  beforeEach(() => {
    selectMock.mockClear();
    insertMock.mockClear();
    valuesMock.mockClear();
    updateMock.mockClear();
    setMock.mockClear();
    deleteMock.mockClear();
    fromMock.mockImplementation((_table: unknown) => ({ where: whereAfterSelectMock }));
    limitMock.mockResolvedValue([noteRow]);
  });

  it("creates and fetches notes", async () => {
    await expect(repo.createNote({ userId: 7, title: "Title", content: "Body" })).resolves.toEqual(noteRow);
    await expect(repo.getNoteById(1, 7)).resolves.toEqual(noteRow);
  });

  it("lists notes by user id", async () => {
    fromMock.mockReturnValueOnce({ where: whereDirectMock } as any);
    await expect(repo.getNotesByUserId(7)).resolves.toEqual([noteRow]);
  });

  it("updates and deletes a note", async () => {
    fromMock.mockImplementation((_table: unknown) => ({ where: whereAfterSelectMock }));
    await expect(repo.updateNote(1, 7, { title: "New" })).resolves.toEqual(noteRow);
    await repo.deleteNote(1, 7);

    expect(updateMock).toHaveBeenCalled();
    expect(setMock).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalled();
  });
});
