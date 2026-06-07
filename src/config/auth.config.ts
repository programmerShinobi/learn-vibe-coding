/*
  Authentication configuration

  Centralizes tunable security parameters for the auth subsystem.

  - `bcryptCost`: the bcrypt work factor (cost) used when hashing passwords.
    OWASP currently recommends a cost of at least 12. The value is read from
    `BCRYPT_COST` so it can be tuned per environment without code changes; it is
    clamped to a sane range and falls back to 12 when unset or invalid.
*/
import dotenv from "dotenv";
dotenv.config();

const DEFAULT_BCRYPT_COST = 12;
// bcrypt only supports cost factors in the 4–31 range.
const MIN_BCRYPT_COST = 10;
const MAX_BCRYPT_COST = 15;

const parseBcryptCost = (value: string | undefined): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < MIN_BCRYPT_COST || parsed > MAX_BCRYPT_COST) {
    return DEFAULT_BCRYPT_COST;
  }
  return parsed;
};

export const authConfig = {
  // Work factor for bcrypt password hashing (OWASP: >= 12).
  bcryptCost: parseBcryptCost(process.env.BCRYPT_COST),
};
