/*
  Auth DTOs (Data Transfer Objects)

  These types define the exact shapes crossing the boundary between HTTP layer
  (controllers) and the service layer for authentication flows.

  Request DTOs describe what the client must send.
  Response DTOs describe what callers receive back — always free of the
  hashed password field so sensitive data never leaks to API consumers.

  Keeping DTOs separate from the Drizzle schema types (`$inferInsert`) means
  the service interface remains stable even if the database schema evolves.
*/

/** Fields required to register a new user account. */
export type RegisterRequestDto = {
  name: string;
  email: string;
  password: string;
};

/** Fields required to authenticate an existing user. */
export type LoginRequestDto = {
  email: string;
  password: string;
};

/** Safe representation of a user — password is always omitted. */
export type UserResponseDto = {
  id: number;
  name: string;
  email: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/** Returned on successful login: user data plus a signed JWT. */
export type LoginResponseDto = UserResponseDto & {
  token: string;
};
