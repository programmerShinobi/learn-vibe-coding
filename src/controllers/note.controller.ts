/*
  Notes controllers

  HTTP handlers for note-related endpoints. Controllers perform the following
  responsibilities:
  - Extract and validate input (URL params, body) using utility validators.
  - Enforce authentication by reading `req.user` populated by the auth
    middleware (the helper `requireAuthenticatedUserId` centralizes this check).

  Controllers do not catch errors. They throw typed errors (`ValidationError`,
  `ForbiddenError`, …) or let service/validator errors propagate; Express 5
  forwards rejected promises from async handlers to the centralized error
  middleware (`src/middlewares/error.middleware.ts`), which maps them to the
  appropriate HTTP status.
*/
import type { Request, Response } from "express";
import * as noteService from "../services/note.service";
import {
  parsePositiveInteger,
  validateNoteInput,
  validateNoteUpdateInput,
} from "../utils/request-validation";
import { ForbiddenError, UnauthorizedError, ValidationError } from "../errors";

/**
 * Return the authenticated user's id from `req.user`.
 * Throws `UnauthorizedError` when it is missing so handlers can assume a valid
 * id afterwards and the error middleware can produce a 401 response.
 */
const requireAuthenticatedUserId = (req: Request): number => {
  if (typeof req.user?.id !== "number") {
    throw new UnauthorizedError("User not found");
  }
  return req.user.id;
};

/** Parse a route param as a positive integer or throw a 400 ValidationError. */
const requirePositiveIntParam = (value: unknown, label: string): number => {
  const parsed = parsePositiveInteger(value);
  if (!parsed) throw new ValidationError(`Invalid ${label}`);
  return parsed;
};

/**
 * POST /api/v1/notes
 * Create a new note. Requires auth. Body: title, content (form-data).
 */
export const createNote = async (req: Request, res: Response): Promise<void> => {
  const userId = requireAuthenticatedUserId(req);
  const { title, content } = validateNoteInput(req.body);
  const note = await noteService.createNote({ userId, title, content });
  res.status(201).json({ message: "Note created successfully", data: note });
};

/**
 * GET /api/v1/notes
 * Get all notes belonging to the authenticated user. Requires auth.
 */
export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  const userId = requireAuthenticatedUserId(req);
  const notes = await noteService.getAllNotes(userId);
  res.status(200).json({ message: "Notes retrieved successfully", data: notes });
};

/**
 * GET /api/v1/notes/:id
 * Get a single note by its ID. Requires auth.
 */
export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  const userId = requireAuthenticatedUserId(req);
  const id = requirePositiveIntParam(req.params.id, "note ID");
  const note = await noteService.getNoteById(id, userId);
  res.status(200).json({ message: "Note retrieved successfully", data: note });
};

/**
 * GET /api/v1/notes/user/:userId
 * Get all notes belonging to a specific user. Requires auth.
 */
export const getNotesByUserId = async (req: Request, res: Response): Promise<void> => {
  const authenticatedUserId = requireAuthenticatedUserId(req);
  const userId = requirePositiveIntParam(req.params.userId, "user ID");

  if (userId !== authenticatedUserId) {
    throw new ForbiddenError("Forbidden: Cannot access another user's notes");
  }

  const notes = await noteService.getNotesByUserId(userId);
  res.status(200).json({ message: "Notes retrieved successfully", data: notes });
};

/**
 * PUT /api/v1/notes/:id
 * Update an existing note by ID. Requires auth. Body: title, content (form-data).
 */
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  const userId = requireAuthenticatedUserId(req);
  const id = requirePositiveIntParam(req.params.id, "note ID");
  const noteUpdate = validateNoteUpdateInput(req.body);
  const updatedNote = await noteService.updateNote(id, userId, noteUpdate);
  res.status(200).json({ message: "Note updated successfully", data: updatedNote });
};

/**
 * DELETE /api/v1/notes/:id
 * Delete a note by ID. Requires auth.
 */
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  const userId = requireAuthenticatedUserId(req);
  const id = requirePositiveIntParam(req.params.id, "note ID");
  await noteService.deleteNote(id, userId);
  res.status(200).json({ message: "Note deleted successfully", data: null });
};
