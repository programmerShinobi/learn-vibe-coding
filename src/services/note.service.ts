/*
  Notes service

  This service layer implements business rules around note management. It
  delegates persistence to the repository layer and translates repository
  results into clear errors or return values suitable for controllers.

  Service functions accept and return DTOs (from `src/dto/note.dto.ts`) so
  the Drizzle schema types stay contained within the repository layer.

  Responsibilities:
  - Ensure resources exist before updating/deleting to provide meaningful
    errors (e.g. "Note not found").
  - Return the persisted note objects to controllers for response building.
*/
import * as noteRepo from "../repositories/note.repository";
import type { CreateNoteDto, UpdateNoteDto, NoteResponseDto } from "../dto/note.dto";

export const createNote = async (noteData: CreateNoteDto): Promise<NoteResponseDto> => {
  return await noteRepo.createNote(noteData);
};

export const getNoteById = async (id: number, userId: number): Promise<NoteResponseDto> => {
  const note = await noteRepo.getNoteById(id, userId);
  if (!note) throw new Error("Note not found");
  return note;
};

/**
 * Return all notes owned by the given user.
 * `getNotesByUserId` is an alias exposed for the `/user/:userId` route,
 * which adds an ownership check at the controller level before calling this.
 */
export const getAllNotes = async (userId: number): Promise<NoteResponseDto[]> => {
  return await noteRepo.getNotesByUserId(userId);
};

export const getNotesByUserId = async (userId: number): Promise<NoteResponseDto[]> => {
  return await noteRepo.getNotesByUserId(userId);
};

export const updateNote = async (id: number, userId: number, noteData: UpdateNoteDto): Promise<NoteResponseDto> => {
  const existingNote = await noteRepo.getNoteById(id, userId);
  if (!existingNote) throw new Error("Note not found");

  return await noteRepo.updateNote(id, userId, noteData);
};

export const deleteNote = async (id: number, userId: number): Promise<void> => {
  const existingNote = await noteRepo.getNoteById(id, userId);
  if (!existingNote) throw new Error("Note not found");

  await noteRepo.deleteNote(id, userId);
};
