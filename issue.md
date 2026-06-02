# Code Review Issues

Review date: 2026-06-02

Review scope: all main source files in `src/`, project configuration, Drizzle migrations, Docker setup, README, and the test suite.

Commands run:

- `bun test --isolate` -> 37 pass, 0 fail.
- `bunx tsc --noEmit` -> fails because of multiple TypeScript errors in test files.

## Priority Summary

| Priority | Issue | Impact |
| --- | --- | --- |
| Critical | Note API does not enforce user ownership | Any authenticated user can read, update, or delete another user's notes |
| High | Drizzle migration is out of sync with the application schema | A database created from the committed migration cannot run the current auth/note features |
| High | JWT secret has a hardcoded fallback | Tokens can be forged if the app is deployed without a strong `JWT_SECRET` |
| Medium | TypeScript strict check fails | CI/build type-safety cannot be trusted even though runtime tests pass |
| Medium | Input validation is too minimal | Invalid data can reach the database, error handling is inconsistent, and API UX suffers |
| Medium | CORS is open to every origin | Production API can be called from untrusted browser origins |
| Low | README/env/Docker database password defaults are inconsistent | New developer onboarding can fail because local credentials differ across files |
| Low | No migration apply/check script in `package.json` | Migration workflow is less reproducible for CI/deployment |

---

## 1. Critical - Note API Does Not Restrict Access by Note Owner

Location:

- `src/routes/note.routes.ts:14-23`
- `src/controllers/note.controller.ts:36-130`
- `src/services/note.service.ts:8-33`
- `src/repositories/note.repository.ts:11-30`
- `src/controllers/note.controller.test.ts:53-77`

Problem:

All note routes go through `authenticate`, but after the token is valid, most note operations do not use `req.user.id` to scope the data. These endpoints accept any authenticated user:

- `GET /api/v1/notes` calls `noteService.getAllNotes()` and returns notes from every user.
- `GET /api/v1/notes/:id` fetches a note by `id` only.
- `GET /api/v1/notes/user/:userId` accepts `userId` from the URL, so a user can request another user's notes.
- `PUT /api/v1/notes/:id` updates a note by `id` only.
- `DELETE /api/v1/notes/:id` deletes a note by `id` only.

Impact:

This is broken object-level authorization. As long as an attacker has any valid JWT, they can enumerate note IDs and read, update, or delete another user's data.

Code evidence:

- The `getAllNotes` controller does not receive `req` and directly fetches all notes.
- `getNoteById`, `updateNote`, and `deleteNote` only parse `req.params.id`.
- Repository queries use only `where(eq(notes.id, id))` for read/update/delete.
- Controller tests currently lock in this behavior: `updateNoteMock` is called with `(1, { title: "New", content: undefined })`, with no `userId`.

Recommendation:

- Make `req.user.id` a required scope for all user-facing note operations.
- Change the public API behavior to:
  - `GET /api/v1/notes` -> return only the current user's notes.
  - `GET /api/v1/notes/:id` -> fetch by both `id` and `userId`.
  - `PUT /api/v1/notes/:id` -> update by both `id` and `userId`.
  - `DELETE /api/v1/notes/:id` -> delete by both `id` and `userId`.
- Remove or restrict `GET /api/v1/notes/user/:userId`; if it remains, make it admin-only or allow it only when `params.userId === req.user.id`.
- Update repository queries to use `and(eq(notes.id, id), eq(notes.userId, userId))`.
- Add negative tests:
  - user A cannot read user B's note.
  - user A cannot update user B's note.
  - user A cannot delete user B's note.
  - `GET /notes` returns only the current user's notes.

Example repository direction:

```ts
import { and, eq } from "drizzle-orm";

export const getNoteByIdForUser = async (id: number, userId: number) => {
  const result = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .limit(1);

  return result[0];
};
```

---

## 2. High - Drizzle Migration Is Out of Sync with the Application Schema

Location:

- `drizzle/0000_sleepy_old_lace.sql:1-8`
- `src/schema/auth.schema.ts:3-10`
- `src/schema/note.schema.ts:4-11`
- `drizzle.config.ts:6-12`

Problem:

The committed SQL migration only creates a `users` table with these columns:

- `id`
- `name`
- `email`
- `created_at`

The application schema expects:

- `users.password`
- `users.updated_at`
- `notes` table
- `notes.user_id`
- `notes.title`
- `notes.content`
- `notes.created_at`
- `notes.updated_at`

Impact:

If a new environment is created from the committed migration, register/login/note functionality will break:

- `registerUser` inserts `password`, but that column does not exist.
- The notes repository queries the `notes` table, but the migration does not create it.
- The README documents the complete schema, but the migration does not represent it.

Recommendation:

- Regenerate the migration from the current schema with `bun run db:generate`.
- Ensure the new migration creates complete `users` and `notes` tables.
- Do not rely only on `db:push` for deployment; committed SQL migrations should be the auditable source of schema changes.
- Add a simple CI check to ensure migrations are up to date, for example by running generate/check against a test or ephemeral database.

---

## 3. High - JWT Secret Has a Hardcoded Fallback

Location:

- `src/config/jwt.config.ts:4-7`
- `src/utils/jwt.utils.ts:4-9`

Problem:

If `JWT_SECRET` is not set, the application uses this default secret:

```ts
"your-super-secret-jwt-key"
```

Impact:

On any deployment that forgets to configure the environment, all tokens can be forged by anyone who knows the source code. The middleware only verifies the token with this secret and then assigns the decoded payload to `req.user`, so an attacker could create a token with any user `id`.

Recommendation:

- Do not provide a fallback JWT secret for production.
- Fail fast during app startup if `JWT_SECRET` is missing or too short.
- Use an explicit payload type, for example `{ id: number; email: string }`, instead of `object` and `any`.
- Validate the decoded payload in the middleware before assigning it to `req.user`.

Example direction:

```ts
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is required");
}

export const jwtConfig = {
  secret,
  expiresIn: "1d",
};
```

---

## 4. Medium - TypeScript Strict Check Fails

Location:

- `package.json:6-11`
- Many errors are in test files, including:
  - `src/app.test.ts`
  - `src/db/index.test.ts`
  - `src/repositories/auth.repository.test.ts`
  - `src/repositories/note.repository.test.ts`
  - `src/routes/auth.routes.test.ts`
  - `src/routes/note.routes.test.ts`
  - `src/services/auth.service.test.ts`
  - `src/services/note.service.test.ts`

Problem:

`bun test --isolate` passes, but `bunx tsc --noEmit` fails. The main error categories are:

- Accessing router/internal layers that may be `undefined`.
- Mock return values that do not match the full Drizzle schema types.
- Drizzle mock chains whose types change between tests.
- Several `expect` calls use partial objects even though the typed return values require full fields like `createdAt` and `updatedAt`.

Impact:

The project looks healthy because runtime tests pass, but strict TypeScript is not green. This makes type-level regressions easier to introduce unnoticed, especially around repository mocks and route internals.

Recommendation:

- Add a script:

```json
"typecheck": "tsc --noEmit"
```

- Fix tests so typecheck passes:
  - use complete fixtures matching `typeof users.$inferSelect` and `typeof notes.$inferSelect`.
  - add helper factories for user/note test data.
  - for Express router internals, use clear local casts or replace those tests with request-level tests.
  - avoid reusing Drizzle chain mocks whose types change without a typed helper.
- Run both `bun run test` and `bun run typecheck` in CI.

---

## 5. Medium - Input Validation Is Too Minimal

Location:

- `src/controllers/auth.controller.ts:8-24`
- `src/controllers/auth.controller.ts:32-47`
- `src/controllers/note.controller.ts:8-29`
- `src/controllers/note.controller.ts:89-110`

Problem:

Validation only checks whether fields are truthy:

- Email format is not validated.
- Password has no minimum length.
- `name`, `title`, and `content` are not trimmed.
- Whitespace-only strings like `"   "` are treated as valid.
- `title` can exceed 255 characters until the database rejects it.
- Note updates send `{ title, content }` including fields that are `undefined`.

Impact:

Bad data can reach the service/repository layer. Database errors can leak through as inconsistent `400/500` responses. API clients also get weaker feedback because validation messages are not precise.

Recommendation:

- Add a centralized validation layer with a library such as Zod or a local helper.
- Normalize input before the service layer:
  - `trim()`
  - email validation
  - minimum password length
  - title length <= 255
  - content must not be empty after trimming
- For note updates, send only fields that are actually present and valid, not `undefined`.
- Add tests for whitespace-only strings, invalid email, short password, overlong title, and partial update.

---

## 6. Medium - CORS Is Open to Every Origin

Location:

- `src/app.ts:7-8`

Problem:

The app uses:

```ts
app.use(cors());
```

This allows browser requests from every origin.

Impact:

This may be acceptable for a public API during development, but for an authenticated production API, an overly permissive origin policy makes unauthorized integrations from any domain easier. The risk becomes higher if tokens are stored in the browser and the frontend has XSS or token leakage issues.

Recommendation:

- Add environment-based CORS configuration, for example `CORS_ORIGIN`.
- In production, allowlist only the official frontend origins.
- Add config tests so the development default remains convenient while production does not silently stay open.

---

## 7. Low - Database Password Defaults Are Inconsistent Across Config, Docker, and README

Location:

- `src/config/db.config.ts:4-6`
- `drizzle.config.ts:10-12`
- `docker-compose.yml:10-14`
- `README.md:87-90`
- `README.md:97-103`

Problem:

Several default credentials differ:

- `src/config/db.config.ts` fallback: `mysql://root:mysql@localhost:3306/vibe_db`
- `drizzle.config.ts` fallback: `mysql://root:mysql@localhost:3306/vibe_db`
- `docker-compose.yml`: `MYSQL_ROOT_PASSWORD=password`
- README env: `mysql://root:password@localhost:3306/vibe_db`

Impact:

A new developer can follow Docker/README, but the app uses a different fallback if `.env` has not been created or is not loaded. This increases the chance of confusing database connection failures.

Recommendation:

- Align all local development defaults.
- Ideally, do not provide a fallback DB URL for production; fail fast if required env is missing.
- Add `.env.example` because the README asks users to run `cp .env.example .env`, but that file is not present in the repo.

---

## 8. Low - No Migration Apply/Check Script

Location:

- `package.json:6-11`

Problem:

The current scripts only include:

- `db:generate`
- `db:push`

There is no script for applying committed SQL migrations or verifying migrations in CI.

Impact:

Teams/deployments are likely to rely on `db:push`, but `db:push` is better suited for fast local development. For repeatable deployment, committed SQL migrations should be applied explicitly.

Recommendation:

- Add a clear migration script, for example using `drizzle-kit migrate` if it matches the chosen workflow.
- Document when to use `db:push` versus migrations.
- Add an ephemeral database smoke test to ensure migrations can build the schema from scratch.

---

## Positive Notes

- The project structure is clear: routes, controllers, services, repositories, schema, config, and middleware.
- Passwords are not returned in register/login responses.
- Public and protected auth routes are separated.
- Runtime test coverage is fairly broad for unit-level behavior and basic route wiring.
- `.env` is listed in `.gitignore` and is not tracked by git.

## Recommended Fix Order

1. Fix note ownership authorization first.
2. Regenerate and commit migrations that match the current schema.
3. Require a valid `JWT_SECRET` without a hardcoded fallback.
4. Make `typecheck` pass and add it to scripts/CI.
5. Add a request body validation layer.
6. Tighten CORS and environment configuration.
7. Align README, Docker, `.env.example`, and config defaults.
