import type { Request, Response } from "express";
import * as noteService from "../services/note.service";

/**
 * POST /api/v1/notes
 * Create a new note. Requires auth. Body: title, content (form-data).
 */
export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;

    // Validate required fields from form-data
    if (!title || !content) {
      res.status(400).json({ message: "Title and content are required", data: null });
      return;
    }

    // Get authenticated user ID from JWT payload (set by auth middleware)
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not found", data: null });
      return;
    }

    const note = await noteService.createNote({ userId, title, content });
    res.status(201).json({ message: "Note created successfully", data: note });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create note", data: null });
  }
};

/**
 * GET /api/v1/notes
 * Get all notes. Requires auth.
 */
export const getAllNotes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const notes = await noteService.getAllNotes();
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
    // Parse and cast the ID from route parameter to ensure it's a string first (Express 5 types req.params as string | string[] | undefined)
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid note ID", data: null });
      return;
    }

    const note = await noteService.getNoteById(id);
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
    const userId = parseInt(String(req.params.userId));
    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user ID", data: null });
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
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid note ID", data: null });
      return;
    }

    const { title, content } = req.body;

    // At least one field must be provided
    if (!title && !content) {
      res.status(400).json({ message: "Title or content is required to update", data: null });
      return;
    }

    const updatedNote = await noteService.updateNote(id, { title, content });
    res.status(200).json({ message: "Note updated successfully", data: updatedNote });
  } catch (error: any) {
    const status = error.message === "Note not found" ? 404 : 500;
    res.status(status).json({ message: error.message || "Failed to update note", data: null });
  }
};

/**
 * DELETE /api/v1/notes/:id
 * Delete a note by ID. Requires auth.
 */
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid note ID", data: null });
      return;
    }

    await noteService.deleteNote(id);
    res.status(200).json({ message: "Note deleted successfully", data: null });
  } catch (error: any) {
    const status = error.message === "Note not found" ? 404 : 500;
    res.status(status).json({ message: error.message || "Failed to delete note", data: null });
  }
};
