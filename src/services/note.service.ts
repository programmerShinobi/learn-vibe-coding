/*
  Notes service

  This service layer implements business rules around note management. It
  delegates persistence to the repository layer and translates repository
  results into clear errors or return values suitable for controllers.

  Responsibilities:
  - Ensure resources exist before updating/deleting to provide meaningful
    errors (e.g. "Note not found").
  - Return the persisted note objects to controllers for response building.
*/
import * as noteRepo from "../repositories/note.repository";
import type { notes } from "../schema/note.schema";

export const createNote = async (noteData: typeof notes.$inferInsert) => {
  return await noteRepo.createNote(noteData);
};

export const getNoteById = async (id: number, userId: number) => {
  const note = await noteRepo.getNoteById(id, userId);
  if (!note) throw new Error("Note not found");
  return note;
};

export const getAllNotes = async (userId: number) => {
  return await noteRepo.getNotesByUserId(userId);
};

export const getNotesByUserId = async (userId: number) => {
  return await noteRepo.getNotesByUserId(userId);
};

export const updateNote = async (id: number, userId: number, noteData: Partial<typeof notes.$inferInsert>) => {
  const existingNote = await noteRepo.getNoteById(id, userId);
  if (!existingNote) throw new Error("Note not found");
  
  return await noteRepo.updateNote(id, userId, noteData);
};

export const deleteNote = async (id: number, userId: number) => {
  const existingNote = await noteRepo.getNoteById(id, userId);
  if (!existingNote) throw new Error("Note not found");
  
  await noteRepo.deleteNote(id, userId);
};
