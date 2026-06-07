/*
  Request validation helpers

  This module centralizes lightweight validation and parsing utilities used by
  controllers to validate incoming HTTP request bodies and parameters. The
  functions operate on `unknown` input and either return a narrowed typed
  object or throw a descriptive `ValidationError` (HTTP 400) on failure, which
  the centralized error middleware maps to a response.

  Input shapes are defined in the DTO layer (`src/dto/`) and re-exported here
  for convenience so controllers only need to import from this file.

  Exported types and functions:
  - `RegisterInput` / `LoginInput` / `NoteInput` / `NoteUpdateInput`: re-exports of DTO input types.
  - `parsePositiveInteger(value)`: safely parse and validate positive integers.
  - `validateRegisterInput(body)`, `validateLoginInput(body)`,
    `validateNoteInput(body)`, `validateNoteUpdateInput(body)`: validators that
    throw on invalid input and return strongly-typed values on success.
*/
import type { RegisterRequestDto, LoginRequestDto } from "../dto/auth.dto";
import type { CreateNoteDto, UpdateNoteDto } from "../dto/note.dto";
import { ValidationError } from "../errors";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Re-export DTO input types under the names controllers already use.
export type RegisterInput = RegisterRequestDto;
export type LoginInput = LoginRequestDto;
export type NoteInput = Pick<CreateNoteDto, "title" | "content">;
export type NoteUpdateInput = UpdateNoteDto;

// Helper: coerce unknown values to trimmed strings for consistent validation.
const getTrimmedString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * Parse a value as a positive integer.
 * @returns parsed integer or `null` when not a positive integer.
 */
export const parsePositiveInteger = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Validate registration input.
 * Throws a `ValidationError` with a human-readable message if validation fails.
 */
export const validateRegisterInput = (body: unknown): RegisterInput => {
  const input = body as Partial<Record<keyof RegisterInput, unknown>>;
  const name = getTrimmedString(input.name);
  const email = getTrimmedString(input.email).toLowerCase();
  const password = getTrimmedString(input.password);

  if (!name || !email || !password) {
    throw new ValidationError("Name, email, and password are required");
  }

  if (!emailPattern.test(email)) {
    throw new ValidationError("Email must be valid");
  }

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  return { name, email, password };
};

/**
 * Validate login input.
 */
export const validateLoginInput = (body: unknown): LoginInput => {
  const input = body as Partial<Record<keyof LoginInput, unknown>>;
  const email = getTrimmedString(input.email).toLowerCase();
  const password = getTrimmedString(input.password);

  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }

  if (!emailPattern.test(email)) {
    throw new ValidationError("Email must be valid");
  }

  return { email, password };
};

/**
 * Validate creation of a note.
 */
export const validateNoteInput = (body: unknown): NoteInput => {
  const input = body as Partial<Record<keyof NoteInput, unknown>>;
  const title = getTrimmedString(input.title);
  const content = getTrimmedString(input.content);

  if (!title || !content) {
    throw new ValidationError("Title and content are required");
  }

  if (title.length > 255) {
    throw new ValidationError("Title must be at most 255 characters");
  }

  return { title, content };
};

/**
 * Validate fields for updating a note. At least one updatable field is required.
 */
export const validateNoteUpdateInput = (body: unknown): NoteUpdateInput => {
  const input = body as Partial<Record<keyof NoteInput, unknown>>;
  const update: NoteUpdateInput = {};

  if (input.title !== undefined) {
    const title = getTrimmedString(input.title);
    if (!title) throw new ValidationError("Title cannot be empty");
    if (title.length > 255) throw new ValidationError("Title must be at most 255 characters");
    update.title = title;
  }

  if (input.content !== undefined) {
    const content = getTrimmedString(input.content);
    if (!content) throw new ValidationError("Content cannot be empty");
    update.content = content;
  }

  if (!update.title && !update.content) {
    throw new ValidationError("Title or content is required to update");
  }

  return update;
};
