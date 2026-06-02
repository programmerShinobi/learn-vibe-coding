import { eq } from "drizzle-orm";
import { db } from "../db";
import { notes } from "../schema/note.schema";

export const createNote = async (noteData: typeof notes.$inferInsert) => {
  const [result] = await db.insert(notes).values(noteData);
  const newNote = await db.select().from(notes).where(eq(notes.id, result.insertId)).limit(1);
  return newNote[0];
};

export const getNoteById = async (id: number) => {
  const result = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  return result[0];
};

export const getAllNotes = async () => {
  return await db.select().from(notes);
};

export const getNotesByUserId = async (userId: number) => {
  return await db.select().from(notes).where(eq(notes.userId, userId));
};

export const updateNote = async (id: number, noteData: Partial<typeof notes.$inferInsert>) => {
  await db.update(notes).set({ ...noteData, updatedAt: new Date() }).where(eq(notes.id, id));
  return await getNoteById(id);
};

export const deleteNote = async (id: number) => {
  await db.delete(notes).where(eq(notes.id, id));
};
