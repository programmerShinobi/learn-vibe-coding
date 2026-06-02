/*
  Notes controllers

  HTTP handlers for note-related endpoints. Controllers perform the following
  responsibilities:
  - Extract and validate input (URL params, body) using utility validators.
  - Enforce authentication by reading `req.user` populated by the auth
    middleware (the helper `getAuthenticatedUserId` centralizes this check).
  - Translate service-layer errors into appropriate HTTP responses.
*/
import type { Request, Response } from "express";
import * as noteService from "../services/note.service";
import {
  parsePositiveInteger,
  validateNoteInput,
  validateNoteUpdateInput,
} from "../utils/request-validation";

/**
 * Return the authenticated user's id from `req.user` if available.
 * Controllers use this helper to ensure requests come from authenticated users
 * and to centralize the type guard for `req.user`.
 */
const getAuthenticatedUserId = (req: Request) => {
  return typeof req.user?.id === "number" ? req.user.id : null;
};

/**
 * POST /api/v1/notes
 * Create a new note. Requires auth. Body: title, content (form-data).
 */
export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user ID from JWT payload (set by auth middleware)
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      res.status(401).json({ message: "User not found", data: null });
      return;
    }

    const { title, content } = validateNoteInput(req.body);
    const note = await noteService.createNote({ userId, title, content });
    res.status(201).json({ message: "Note created successfully", data: note });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create note", data: null });
  }
};

/**
 * GET /api/v1/notes
 * Get all notes belonging to the authenticated user. Requires auth.
 */
export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      res.status(401).json({ message: "User not found", data: null });
      return;
    }

    const notes = await noteService.getAllNotes(userId);
    res.status(200).json({ message: "Notes retrieved successfully", data: notes });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to retrieve notes", data: null });
  }
};

/**
 * GET /api/v1/notes/:id
 * Get a single note by its ID. Requires auth.
 */
export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      res.status(401).json({ message: "User not found", data: null });
      return;
    }

    const id = parsePositiveInteger(req.params.id);
    if (!id) {
      res.status(400).json({ message: "Invalid note ID", data: null });
      return;
    }

    const note = await noteService.getNoteById(id, userId);
    res.status(200).json({ message: "Note retrieved successfully", data: note });
  } catch (error: any) {
    const status = error.message === "Note not found" ? 404 : 500;
    res.status(status).json({ message: error.message || "Failed to retrieve note", data: null });
  }
};

/**
 * GET /api/v1/notes/user/:userId
 * Get all notes belonging to a specific user. Requires auth.
 */
export const getNotesByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = getAuthenticatedUserId(req);
    if (!authenticatedUserId) {
      res.status(401).json({ message: "User not found", data: null });
      return;
    }

    const userId = parsePositiveInteger(req.params.userId);
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID", data: null });
      return;
    }

    if (userId !== authenticatedUserId) {
      res.status(403).json({ message: "Forbidden: Cannot access another user's notes", data: null });
      return;
    }

    const notes = await noteService.getNotesByUserId(userId);
    res.status(200).json({ message: "Notes retrieved successfully", data: notes });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to retrieve notes", data: null });
  }
};

/**
 * PUT /api/v1/notes/:id
 * Update an existing note by ID. Requires auth. Body: title, content (form-data).
 */
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      res.status(401).json({ message: "User not found", data: null });
      return;
    }

    const id = parsePositiveInteger(req.params.id);
    if (!id) {
      res.status(400).json({ message: "Invalid note ID", data: null });
      return;
    }

    const noteUpdate = validateNoteUpdateInput(req.body);
    const updatedNote = await noteService.updateNote(id, userId, noteUpdate);
    res.status(200).json({ message: "Note updated successfully", data: updatedNote });
  } catch (error: any) {
    const validationErrors = ["Title or content is required to update", "Title cannot be empty", "Content cannot be empty", "Title must be at most 255 characters"];
    const status = error.message === "Note not found" ? 404 : validationErrors.includes(error.message) ? 400 : 500;
    res.status(status).json({ message: error.message || "Failed to update note", data: null });
  }
};

/**
 * DELETE /api/v1/notes/:id
 * Delete a note by ID. Requires auth.
 */
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      res.status(401).json({ message: "User not found", data: null });
      return;
    }

    const id = parsePositiveInteger(req.params.id);
    if (!id) {
      res.status(400).json({ message: "Invalid note ID", data: null });
      return;
    }

    await noteService.deleteNote(id, userId);
    res.status(200).json({ message: "Note deleted successfully", data: null });
  } catch (error: any) {
    const status = error.message === "Note not found" ? 404 : 500;
    res.status(status).json({ message: error.message || "Failed to delete note", data: null });
  }
};
