/*
  Notes routes

  All endpoints in this router are protected by the JWT `authenticate`
  middleware. The router exposes standard CRUD operations. Important routing
  note: the `/user/:userId` route is placed before `/:id` to avoid parameter
  collisions (Express matches routes in declaration order).
*/
import { Router } from "express";
import {
  createNote,
  getAllNotes,
  getNoteById,
  getNotesByUserId,
  updateNote,
  deleteNote,
} from "../controllers/note.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All note routes require authentication via JWT
router.use(authenticate);

// Note CRUD routes
router.post("/", createNote);                         // Create a new note
router.get("/", getAllNotes);                         // Get all notes
router.get("/user/:userId", getNotesByUserId);        // Get notes by user ID (must be before /:id)
router.get("/:id", getNoteById);                      // Get a single note by ID
router.put("/:id", updateNote);                       // Update a note by ID
router.delete("/:id", deleteNote);                    // Delete a note by ID

export default router;
