import * as noteRepo from "../repositories/note.repository";
import type { notes } from "../schema/note.schema";

export const createNote = async (noteData: typeof notes.$inferInsert) => {
  return await noteRepo.createNote(noteData);
};

export const getNoteById = async (id: number) => {
  const note = await noteRepo.getNoteById(id);
  if (!note) throw new Error("Note not found");
  return note;
};

export const getAllNotes = async () => {
  return await noteRepo.getAllNotes();
};

export const getNotesByUserId = async (userId: number) => {
  return await noteRepo.getNotesByUserId(userId);
};

export const updateNote = async (id: number, noteData: Partial<typeof notes.$inferInsert>) => {
  const existingNote = await noteRepo.getNoteById(id);
  if (!existingNote) throw new Error("Note not found");
  
  return await noteRepo.updateNote(id, noteData);
};

export const deleteNote = async (id: number) => {
  const existingNote = await noteRepo.getNoteById(id);
  if (!existingNote) throw new Error("Note not found");
  
  await noteRepo.deleteNote(id);
};
