/*
  Application error classes

  These custom error types carry an HTTP `statusCode` alongside the message so
  the centralized error-handling middleware can map a thrown error to the right
  response without fragile string matching on `error.message`.

  Usage:
  - Services and validators throw a specific subclass (e.g. `NotFoundError`).
  - Controllers simply let the error propagate (Express 5 forwards rejected
    promises from async handlers to the error middleware).
  - `errorHandler` reads `statusCode` and serializes a consistent JSON body.

  `isOperational` distinguishes expected, client-facing errors (validation,
  not-found, etc.) from unexpected programming/infrastructure failures so the
  middleware can decide what to log and what message to expose.
*/

/** Base class for all known, HTTP-mappable application errors. */
export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    // Restore the prototype chain and set a useful `name` for each subclass.
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Capture a clean stack trace where available (V8 / Bun).
    Error.captureStackTrace?.(this, new.target);
  }
}

/** 400 - the request was malformed or failed validation. */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/** 401 - authentication is missing or invalid. */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 403 - authenticated but not allowed to access the resource. */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/** 404 - the requested resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

/** 409 - the request conflicts with current state (e.g. duplicate email). */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
