/*
  Note DTOs (Data Transfer Objects)

  These types define the exact shapes that cross layer boundaries for note
  operations. Controllers pass request DTOs into services; services return
  response DTOs to controllers.

  Using dedicated DTOs instead of raw Drizzle `$inferInsert` types keeps the
  service API stable and makes it explicit which fields each operation needs.
*/

/** Fields required to create a new note. `userId` is sourced from the JWT, not the request body. */
export type CreateNoteDto = {
  userId: number;
  title: string;
  content: string;
};

/** Fields that may be updated on an existing note. At least one field is required by the validator. */
export type UpdateNoteDto = {
  title?: string;
  content?: string;
};

/** Shape of a note object returned to API consumers. */
export type NoteResponseDto = {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};
