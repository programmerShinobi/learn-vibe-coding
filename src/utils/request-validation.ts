/*
  Request validation helpers

  This module centralizes lightweight validation and parsing utilities used by
  controllers to validate incoming HTTP request bodies and parameters. The
  functions operate on `unknown` input and either return a narrowed typed
  object or throw a descriptive `Error` on validation failure.

  Exported types and functions:
  - `RegisterInput` / `LoginInput` / `NoteInput` / `NoteUpdateInput`: input shapes.
  - `parsePositiveInteger(value)`: safely parse and validate positive integers.
  - `validateRegisterInput(body)`, `validateLoginInput(body)`,
    `validateNoteInput(body)`, `validateNoteUpdateInput(body)`: validators that
    throw on invalid input and return strongly-typed values on success.
*/

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type NoteInput = {
  title: string;
  content: string;
};

export type NoteUpdateInput = Partial<NoteInput>;

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
 * Throws an Error with a human-readable message if validation fails.
 */
export const validateRegisterInput = (body: unknown): RegisterInput => {
  const input = body as Partial<Record<keyof RegisterInput, unknown>>;
  const name = getTrimmedString(input.name);
  const email = getTrimmedString(input.email).toLowerCase();
  const password = getTrimmedString(input.password);

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  if (!emailPattern.test(email)) {
    throw new Error("Email must be valid");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
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
    throw new Error("Email and password are required");
  }

  if (!emailPattern.test(email)) {
    throw new Error("Email must be valid");
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
    throw new Error("Title and content are required");
  }

  if (title.length > 255) {
    throw new Error("Title must be at most 255 characters");
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
    if (!title) throw new Error("Title cannot be empty");
    if (title.length > 255) throw new Error("Title must be at most 255 characters");
    update.title = title;
  }

  if (input.content !== undefined) {
    const content = getTrimmedString(input.content);
    if (!content) throw new Error("Content cannot be empty");
    update.content = content;
  }

  if (!update.title && !update.content) {
    throw new Error("Title or content is required to update");
  }

  return update;
};
