/*
  Rate limiting middleware

  Authentication endpoints (`/auth/login`, `/auth/register`) are common targets
  for brute-force and credential-stuffing attacks. `authRateLimiter` caps the
  number of requests per client IP within a time window and responds with HTTP
  429 once the limit is exceeded.

  The window and max are configurable via `AUTH_RATE_LIMIT_WINDOW_MS` and
  `AUTH_RATE_LIMIT_MAX` so they can be tuned per environment. Responses keep the
  application-wide `{ message, data }` shape.
*/
import rateLimit from "express-rate-limit";

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX = 10; // requests per window per IP

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const authRateLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  limit: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, DEFAULT_MAX),
  standardHeaders: "draft-7", // expose standard RateLimit headers
  legacyHeaders: false, // disable deprecated X-RateLimit-* headers
  message: { message: "Too many requests, please try again later", data: null },
});
