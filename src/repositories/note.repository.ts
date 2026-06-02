/*
  Notes repository

  Low-level operations to create, read, update, and delete notes in the
  `notes` table. Functions are intentionally focused on single responsibilities
  and assume the caller enforces authorization by providing `userId` where
  appropriate.

  Functions return the raw database rows (or nothing for deletions). Services
  wrap these to implement business rules, error messages, and additional
  transformations.
*/
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { notes } from "../schema/note.schema";

export const createNote = async (noteData: typeof notes.$inferInsert) => {
  const [result] = await db.insert(notes).values(noteData);
  const newNote = await db.select().from(notes).where(eq(notes.id, result.insertId)).limit(1);
  return newNote[0];
};

export const getNoteById = async (id: number, userId: number) => {
  // Retrieve a single note belonging to the provided user.
  const result = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .limit(1);
  return result[0];
};

export const getNotesByUserId = async (userId: number) => {
  // Return all notes for a given user. Consumers can paginate/filter if needed.
  return await db.select().from(notes).where(eq(notes.userId, userId));
};

export const updateNote = async (id: number, userId: number, noteData: Partial<typeof notes.$inferInsert>) => {
  // Update fields and set `updatedAt` timestamp. Caller must ensure ownership.
  await db
    .update(notes)
    .set({ ...noteData, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)));
  return await getNoteById(id, userId);
};

export const deleteNote = async (id: number, userId: number) => {
  // Delete a note only when it belongs to the provided user.
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
};
