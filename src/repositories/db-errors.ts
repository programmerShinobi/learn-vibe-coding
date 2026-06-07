/*
  Database error helpers

  Small utilities for classifying low-level driver errors so the service layer
  can react to specific failure modes (e.g. a unique-constraint violation)
  without coupling to the `mysql2` package directly.
*/

// MySQL signals a duplicate entry for a unique/primary key with errno 1062
// (code `ER_DUP_ENTRY`).
const MYSQL_DUP_ENTRY_ERRNO = 1062;

/**
 * Returns true when the given error represents a unique-constraint violation
 * from MySQL (duplicate key). Used to translate races on unique columns into a
 * `ConflictError` instead of pre-checking with a separate query.
 */
export const isDuplicateKeyError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; errno?: number };
  return candidate.code === "ER_DUP_ENTRY" || candidate.errno === MYSQL_DUP_ENTRY_ERRNO;
};
