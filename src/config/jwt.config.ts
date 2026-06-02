/*
  JWT configuration

  Responsibilities:
  - Load the `JWT_SECRET` from environment variables and validate it.
  - Export a minimal `jwtConfig` object consumed by authentication utilities.

  Security notes:
  - `JWT_SECRET` must be present in the environment; otherwise the application
    refuses to start (fail-fast behavior avoids running with an insecure default).
  - The secret length is enforced (>= 32 characters) to encourage high-entropy keys.

  The exported `jwtConfig` contains:
  - `secret`: the raw secret string used to sign/verifiy tokens.
  - `expiresIn`: the default token lifetime (here set to one day).
*/
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  // Fail fast: avoid silently operating without a configured JWT secret.
  throw new Error("JWT_SECRET is required");
}

if (secret.length < 32) {
  // Enforce a minimum entropy for the secret; shorter secrets are insecure.
  throw new Error("JWT_SECRET must be at least 32 characters");
}

export const jwtConfig = {
  // Secret used for signing and verifying JWTs. Keep this confidential.
  secret,
  // Default expiry for tokens (can be overridden by sign calls if needed).
  expiresIn: "1d",
};
