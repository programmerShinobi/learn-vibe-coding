# Notes API

A server application for managing notes with user authentication. It is built with modern backend technologies and follows backend development best practices.

**In simple terms:** This application works like a digital notepad that can be accessed from anywhere. Each user must log in first, then they can create, read, update, and delete their own notes.

---

## Key Features

- **User Registration & Login** — Authentication system with encrypted passwords
- **JWT Token Revocation** — Tokens are invalidated server-side on logout
- **Notes CRUD** — Create, read, update, and delete notes
- **DTO Layer** — Explicit request/response types that keep DB schema types internal
- **Security** — JWT-based protection for user data
- **Database** — Secure data storage using MySQL
- **Unit Tests** — 38 automated tests to ensure code quality
- **Hot Reload** — Code changes are reflected instantly without restarting the server

---

## Tech Stack

| Layer | Technology | Simple Explanation |
|-------|-----------|-------------------|
| **Runtime** | [Bun](https://bun.sh/) | A JavaScript/TypeScript runtime. Faster than Node.js |
| **Web Framework** | [Express.js](https://expressjs.com/) v5 | A library for building web APIs easily |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | A tool for interacting with the database without writing raw SQL |
| **Database** | MySQL 8+ | A reliable and widely used database system |
| **Authentication** | JWT | A token-based system to verify user identity |
| **Password Security** | bcryptjs | A library for hashing passwords securely |

---

## Project Structure

```text
📦 belajar-vibe-coding/
├── 📁 src/                    # Main application code
│   ├── 📄 app.ts              # Express setup (middleware, route mounting)
│   ├── 📄 server.ts           # Entrypoint - starts the server
│   │
│   ├── 📁 config/             # Application configuration
│   │   ├── 📄 cors.config.ts  # CORS allowed origins configuration
│   │   ├── 📄 db.config.ts    # Database connection configuration
│   │   └── 📄 jwt.config.ts   # JWT configuration (secret, expiration)
│   │
│   ├── 📁 db/                 # Database
│   │   └── 📄 index.ts        # Drizzle ORM initialization & MySQL connection
│   │
│   ├── 📁 dto/                # Data Transfer Objects
│   │   ├── 📄 auth.dto.ts     # Auth request & response types (RegisterRequestDto, LoginResponseDto, …)
│   │   └── 📄 note.dto.ts     # Note request & response types (CreateNoteDto, NoteResponseDto, …)
│   │
│   ├── 📁 schema/             # Database table definitions (Drizzle ORM)
│   │   ├── 📄 auth.schema.ts  # 'users' table structure
│   │   ├── 📄 note.schema.ts  # 'notes' table structure
│   │   └── 📄 token.schema.ts # 'revoked_tokens' table structure
│   │
│   ├── 📁 repositories/       # Direct database access
│   │   ├── 📄 auth.repository.ts  # Queries for users table
│   │   ├── 📄 note.repository.ts  # Queries for notes table
│   │   └── 📄 token.repository.ts # Queries for revoked_tokens table
│   │
│   ├── 📁 services/           # Business logic
│   │   ├── 📄 auth.service.ts # Registration, login, password hashing
│   │   └── 📄 note.service.ts # Notes CRUD logic
│   │
│   ├── 📁 controllers/        # Handle HTTP requests/responses
│   │   ├── 📄 auth.controller.ts  # Register, login, logout endpoints
│   │   └── 📄 note.controller.ts  # Notes CRUD endpoints
│   │
│   ├── 📁 middlewares/        # Functions executed before controllers
│   │   └── 📄 auth.middleware.ts  # JWT token verification & revocation check
│   │
│   ├── 📁 routes/             # Endpoint definitions
│   │   ├── 📄 auth.routes.ts  # Routes for /api/v1/auth
│   │   ├── 📄 note.routes.ts  # Routes for /api/v1/notes
│   │   └── 📄 index.ts        # Aggregates all route groups
│   │
│   └── 📁 utils/              # Helper functions
│       ├── 📄 jwt.utils.ts             # Generate & verify JWT
│       └── 📄 request-validation.ts    # Input validation helpers
│
├── 📁 test/                   # All unit tests (38 tests across 19 files)
│   ├── 📁 config/             # Tests for db.config and jwt.config
│   ├── 📁 controllers/        # Tests for auth and note controllers
│   ├── 📁 db/                 # Tests for DB initialization
│   ├── 📁 middlewares/        # Tests for auth middleware
│   ├── 📁 repositories/       # Tests for auth and note repositories
│   ├── 📁 routes/             # Tests for route wiring
│   ├── 📁 schema/             # Tests for Drizzle schema definitions
│   ├── 📁 services/           # Tests for auth and note services
│   ├── 📁 utils/              # Tests for JWT utilities
│   └── 📁 test-utils/         # Shared mock helpers
│
├── 📁 drizzle/                # Database migrations
│   ├── 📄 *.sql               # Migration files
│   └── 📁 meta/               # Migration metadata
│
├── 📄 package.json            # Dependencies & scripts
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 drizzle.config.ts       # Drizzle ORM configuration
├── 📄 docker-compose.yml      # Docker setup for MySQL
├── 📄 .env.example            # Example environment file
└── 📄 README.md               # This file
```

---

## Application Data Flow

```text
User Request
    ↓
┌─────────────────────────────────────┐
│ Router (routes/)                    │ → Determines which endpoint is accessed
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Middleware (middlewares/)           │ → Verifies JWT; checks token revocation
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Controller (controllers/)           │ → Validates input via request-validation.ts
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ DTO (dto/)                          │ → Typed request/response shapes crossing layer boundaries
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Service (services/)                 │ → Business logic, password hashing, token generation
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Repository (repositories/)          │ → Sends type-safe queries to the database
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Database (MySQL)                    │ → Stores/retrieves data
└─────────────────────────────────────┘
    ↓
JSON Response → User
```

---

## Layer Responsibilities

| Layer | Function | Analogy |
|-------|----------|---------|
| **Routes** | Defines URL endpoints | Front door |
| **Middleware** | Verifies JWT and checks token revocation | Security guard |
| **Controller** | Receives and validates input | Receptionist |
| **DTO** | Typed shapes passed between controller and service | Official form templates |
| **Service** | Processes business logic | Chef preparing the dish |
| **Repository** | Executes database queries | Warehouse clerk |
| **Database** | Stores and retrieves data | Storage warehouse |

---

## Prerequisites

Before running this application, make sure you have installed:

1. **[Bun](https://bun.sh/)** >= 1.0  
   Bun is a modern JavaScript runtime and a faster alternative to Node.js.  
   Installation instructions are available at `https://bun.sh`.

2. **MySQL** 8+  
   This is used to store application data. You can install it locally or use Docker.

**Check your installation:**

```bash
bun --version
mysql --version
```

---

## How to Run the Application

### Step 1: Clone the Repository

```bash
git clone https://github.com/programmerShinobi/learn-vibe-coding.git
cd learn-vibe-coding
```

**What does this do?**  
Cloning downloads the project code from the internet to your computer.

---

### Step 2: Install Dependencies

```bash
bun install
```

**What does this do?**  
This downloads all libraries required by the application, as listed in `package.json`.

---

### Step 3: Set Up Environment Variables

Environment variables store secret configuration values that should not be shared publicly, such as database credentials.

**Create a `.env` file:**

```bash
cp .env.example .env
```

**Edit the `.env` file with your own values:**

```env
# Database configuration
DATABASE_URL="mysql://root:mysql@localhost:3306/vibe_db"
# Format: mysql://username:password@host:port/database_name

# JWT configuration (use a random string with at least 32 characters)
JWT_SECRET="replace-with-a-random-string-of-32-or-more-characters"

# Application port
PORT=3000

# CORS (allowed request origin)
CORS_ORIGIN=
```

---

### Step 4: Set Up MySQL Database

#### Option A: Use Docker (Recommended)

Docker lets you run applications inside isolated containers.

```bash
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=mysql \
  -e MYSQL_DATABASE=vibe_db \
  -p 3306:3306 \
  mysql:8.0
```

**Explanation:**

- `-d` = run in the background
- `--name mysql-db` = container name
- `-e MYSQL_ROOT_PASSWORD=mysql` = MySQL root password
- `-e MYSQL_DATABASE=vibe_db` = create a database named `vibe_db`
- `-p 3306:3306` = port mapping
- `mysql:8.0` = MySQL version used

**Check whether MySQL is running:**

```bash
docker ps
```

#### Option B: Use Local MySQL

If MySQL is already installed on your computer:

```bash
# Log in to MySQL
mysql -u root -p

# Run this inside the MySQL CLI:
CREATE DATABASE IF NOT EXISTS vibe_db;
EXIT;
```

---

### Step 5: Run Database Migration

A migration creates database tables based on the schema you defined in the codebase.

```bash
bun run db:push
```

**Expected output:**

```text
✓ Database schema pushed successfully
✓ 3 tables created: users, notes, revoked_tokens
```

---

### Step 6: Start the Server

```bash
bun run dev
```

**Expected output:**

```text
  ███╗   ██╗ ██████╗ ████████╗███████╗███████╗
  ████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝
  ██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗
  ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║
  ██║ ╚████║╚██████╔╝   ██║   ███████╗███████║
  ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝
            A P I   S E R V E R
  ─────────────────────────────────────────────
  ▶  Status   : Running ✅
  ▶  Port     : http://localhost:3000
  ▶  Endpoint : http://localhost:3000/api/v1
  ▶  Mode     : development
  ─────────────────────────────────────────────
```

The server is now running successfully.

---

## Important Commands

| Command | Function | When to Use |
|---------|----------|-------------|
| `bun run dev` | Start the server with auto-reload | During development |
| `bun run test` | Run all unit tests (38 tests) | Before pushing changes |
| `bun run typecheck` | Check for TypeScript errors | Validate syntax without running |
| `bun run db:push` | Update database schema | After changing schema |
| `bun run db:generate` | Generate migration files | After updating schema in code |
| `bun run db:migrate` | Apply migrations to the database | For production setup |

**Example:**

```bash
# Development
bun run dev

# Testing
bun run test

# Database
bun run db:push
```

---

## Database Structure

### `users` Table

This table stores user information.

| Column | Type | Description |
|-------|------|-------------|
| `id` | INT | Unique user ID (auto increment) |
| `name` | VARCHAR(255) | User's name |
| `email` | VARCHAR(255) | Email address (must be unique) |
| `password` | VARCHAR(255) | Hashed password |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last updated time |

**Example data:**

```text
id | name      | email            | password (hash) | created_at
1  | John Doe  | john@example.com | $2a$10$xxxx...  | 2024-06-03
```

---

### `notes` Table

This table stores all notes created by users.

| Column | Type | Description |
|-------|------|-------------|
| `id` | INT | Unique note ID |
| `user_id` | INT | ID of the user who created the note (FK) |
| `title` | VARCHAR(255) | Note title |
| `content` | TEXT | Note content |
| `created_at` | TIMESTAMP | Note creation time |
| `updated_at` | TIMESTAMP | Last updated time |

**Example data:**

```text
id | user_id | title      | content               | created_at
1  | 1       | My Notes   | This is a note...     | 2024-06-03
2  | 1       | To Do List | 1. Buy milk...        | 2024-06-03
```

**Table relationship:**

```text
users (1) ──── (Many) notes
         via user_id
```

---

### `revoked_tokens` Table

Stores JWTs that have been explicitly invalidated on logout. The auth middleware checks this table on every request to reject revoked tokens before their natural expiry.

| Column | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key (auto increment) |
| `token` | VARCHAR(1024) | Full JWT string that was revoked |
| `expires_at` | TIMESTAMP | Token's original expiry time (used for cleanup) |
| `created_at` | TIMESTAMP | When the token was revoked |

**Important:** For production, consider storing a hash of the token instead of the raw JWT string to avoid keeping sensitive values in the database in plaintext.

---

## Security and Authentication

### Base URL

```text
http://localhost:3000/api/v1
```

**Example endpoints:**

- `http://localhost:3000/api/v1/auth/register`
- `http://localhost:3000/api/v1/auth/login`
- `http://localhost:3000/api/v1/notes`

---

### Request Format

All request bodies use **form-data**:

```text
Content-Type: application/x-www-form-urlencoded
```

**Example:**

```text
name=John Doe&email=john@example.com&password=secret123
```

---

### Response Format

All responses are JSON with the same structure:

```json
{
  "message": "Descriptive message",
  "data": {}
}
```

The `data` field can be an object, an array, or `null`.

**Success example:**

```json
{
  "message": "User logged in successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error example:**

```json
{
  "message": "Validation error",
  "data": null
}
```

---

## Authentication Endpoints

### 1. Register

```http
POST /api/v1/auth/register
```

Creates a new account using a name, email, and password.

**Required fields:**

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `name` | string | Yes | John Doe |
| `email` | string | Yes | john@example.com |
| `password` | string | Yes | secret123 |

**Example using curl:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -d "name=John Doe&email=john@example.com&password=password123"
```

**Successful response (201 Created):**

```json
{
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-06-03T10:00:00.000Z",
    "updatedAt": "2024-06-03T10:00:00.000Z"
  }
}
```

**Error response (400 - email already registered):**

```json
{
  "message": "User already exists",
  "data": null
}
```

---

### 2. Login

```http
POST /api/v1/auth/login
```

Logs in a user and returns an authentication token.

**Required fields:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |

**Example using curl:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d "email=john@example.com&password=password123"
```

**Successful response (200 OK):**

```json
{
  "message": "User logged in successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-06-03T10:00:00.000Z",
    "updatedAt": "2024-06-03T10:00:00.000Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Important:** Save this token. It is valid for **1 day** and is required to access notes endpoints.

---

### 3. Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

Logs the user out and revokes the token so it can no longer be used.

**Header:**

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example using curl:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <token>"
```

**Successful response (200 OK):**

```json
{
  "message": "User logged out successfully",
  "data": null
}
```

---

## Notes Endpoints (CRUD)

**Important:** All notes endpoints require the following header:

```text
Authorization: Bearer <token>
```

Replace `<token>` with the token you received during login.

---

### 1. Create a New Note

```http
POST /api/v1/notes
Authorization: Bearer <token>
```

**Required fields:**

| Field | Type | Required |
|-------|------|----------|
| `title` | string | Yes |
| `content` | string | Yes |

**Example using curl:**

```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Authorization: Bearer <token>" \
  -d "title=Important Note&content=Do not forget to buy milk"
```

**Successful response (201 Created):**

```json
{
  "message": "Note created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Important Note",
    "content": "Do not forget to buy milk",
    "createdAt": "2024-06-03T10:00:00.000Z",
    "updatedAt": "2024-06-03T10:00:00.000Z"
  }
}
```

---

### 2. Get All My Notes

```http
GET /api/v1/notes
Authorization: Bearer <token>
```

Returns all notes created by the currently logged-in user.

**Example using curl:**

```bash
curl -X GET http://localhost:3000/api/v1/notes \
  -H "Authorization: Bearer <token>"
```

**Successful response (200 OK):**

```json
{
  "message": "Notes retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Important Note",
      "content": "Do not forget to buy milk",
      "createdAt": "2024-06-03T10:00:00.000Z",
      "updatedAt": "2024-06-03T10:00:00.000Z"
    },
    {
      "id": 2,
      "userId": 1,
      "title": "To Do List",
      "content": "1. Buy milk\n2. Study coding",
      "createdAt": "2024-06-03T10:05:00.000Z",
      "updatedAt": "2024-06-03T10:05:00.000Z"
    }
  ]
}
```

---

### 3. Get a Note by ID

```http
GET /api/v1/notes/:id
Authorization: Bearer <token>
```

**Parameter:**

- `id` = note ID

**Example using curl:**

```bash
curl -X GET http://localhost:3000/api/v1/notes/1 \
  -H "Authorization: Bearer <token>"
```

**Successful response (200 OK):**

```json
{
  "message": "Note retrieved successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Important Note",
    "content": "Do not forget to buy milk",
    "createdAt": "2024-06-03T10:00:00.000Z",
    "updatedAt": "2024-06-03T10:00:00.000Z"
  }
}
```

**Error response (404 Not Found):**

```json
{
  "message": "Note not found",
  "data": null
}
```

---

### 4. Get Notes by User ID

```http
GET /api/v1/notes/user/:userId
Authorization: Bearer <token>
```

**Parameter:**

- `userId` = ID of the user whose notes you want to retrieve

**Example using curl:**

```bash
curl -X GET http://localhost:3000/api/v1/notes/user/1 \
  -H "Authorization: Bearer <token>"
```

**Successful response (200 OK):**

```json
{
  "message": "Notes retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Important Note",
      "content": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 5. Update a Note

```http
PUT /api/v1/notes/:id
Authorization: Bearer <token>
```

**Parameter:**

- `id` = note ID to update

**Request fields:** at least one of the following must be provided.

| Field | Type | Required |
|-------|------|----------|
| `title` | string | One of the two |
| `content` | string | One of the two |

**Example using curl:**

```bash
curl -X PUT http://localhost:3000/api/v1/notes/1 \
  -H "Authorization: Bearer <token>" \
  -d "title=Updated Note&content=New content"
```

**Successful response (200 OK):**

```json
{
  "message": "Note updated successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Updated Note",
    "content": "New content",
    "createdAt": "2024-06-03T10:00:00.000Z",
    "updatedAt": "2024-06-03T10:10:00.000Z"
  }
}
```

---

### 6. Delete a Note

```http
DELETE /api/v1/notes/:id
Authorization: Bearer <token>
```

**Parameter:**

- `id` = note ID to delete

**Example using curl:**

```bash
curl -X DELETE http://localhost:3000/api/v1/notes/1 \
  -H "Authorization: Bearer <token>"
```

**Successful response (200 OK):**

```json
{
  "message": "Note deleted successfully",
  "data": null
}
```

---

## HTTP Error Codes

| HTTP Code | Meaning | Cause | Solution |
|-----------|---------|-------|----------|
| **200** | OK | Request succeeded | — |
| **201** | Created | Resource created successfully | — |
| **400** | Bad Request | Invalid or incomplete input | Check the submitted data |
| **401** | Unauthorized | Missing, invalid, or expired token | Log in again and get a new token |
| **404** | Not Found | Requested resource does not exist | Check the ID or endpoint URL |
| **500** | Server Error | Internal server issue | Contact the developer |

**Example error responses:**

**400 - Validation failed**

```json
{
  "message": "Email is required",
  "data": null
}
```

**401 - Invalid token**

```json
{
  "message": "Unauthorized: Token missing or invalid",
  "data": null
}
```

**404 - Note not found**

```json
{
  "message": "Note not found",
  "data": null
}
```

---

## Testing

This application includes **38 unit tests** across **19 files** to ensure code quality.

**Run all tests:**

```bash
bun run test
```

**Expected output:**

```text
38 pass
0 fail
114 expect() calls
Ran 38 tests across 19 files.
```

**Test coverage includes:**

| Area | What is tested |
|------|---------------|
| **Config** | DB and JWT configuration loading & validation |
| **DB** | Drizzle ORM initialization |
| **Schema** | Drizzle table definitions |
| **Repositories** | Auth and note database queries |
| **Services** | Business logic for auth and notes |
| **Controllers** | Register, login, logout, notes CRUD handlers |
| **Middleware** | JWT verification and token revocation check |
| **Routes** | Endpoint wiring for `/auth` and `/notes` |
| **Utils** | JWT generate and verify helpers |
| **Test utils** | Shared mock helpers |

Each layer of the application is tested to help prevent bugs.

---

## What Is a JWT Token?

JWT (*JSON Web Token*) is a secure way to identify users without sending their password on every request.

**Simple analogy:** It is like a movie ticket. After you buy the ticket, you do not need to pay again each time you enter. You just show the ticket.

**How it works:**

1. The user logs in with email and password
2. The server generates a token and sends it to the user
3. The user stores the token and includes it in every request
4. The server verifies the token; if valid, access is granted

**Token validity:** 1 day

---

## What Is bcryptjs?

`bcryptjs` is a library used to hash passwords. This means passwords are stored securely and cannot be read in plain text, even by the server administrator.

**Example:**

```text
Original password: "password123"
Hashed password: "$2a$10$kN21cpF3/Us.MNNC3z0CuO2/q94F.."
```

Passwords are never stored in their original form. Only the hash is saved.

---

## What Is an ORM?

An ORM (*Object-Relational Mapping*) acts like a translator between JavaScript code and an SQL database.

**Without ORM (raw SQL):**

```sql
SELECT * FROM users WHERE id = 1;
```

**With ORM (Drizzle):**

```typescript
const user = await db.select().from(users).where(eq(users.id, 1));
```

Using an ORM makes code easier to read and helps protect against SQL injection.

---

## Folder Structure Best Practice

This project follows the **Clean Architecture** pattern:

```text
routes/       - Entry point (URL routing)
  ↓
controllers/  - Receives & validates HTTP requests
  ↓
dto/          - Typed request/response shapes (no DB types leak across layers)
  ↓
services/     - Business logic
  ↓
repositories/ - Database queries (Drizzle schema types stay here)
  ↓
database/     - Actual data storage
```

Each layer has a clear and separate responsibility. This makes the codebase easier to maintain and test.

---

## Tips and Troubleshooting

### Error: `Cannot find module 'mysql2'`

**Solution:**

```bash
bun install
```

### Error: `ECONNREFUSED 127.0.0.1:3306`

**Meaning:** MySQL is not running.

**Solution:**

- If using Docker: `docker start mysql-db`
- If using local MySQL: make sure the MySQL service is running

### Error: `Invalid token`

**Meaning:** The token is expired or incorrect.

**Solution:**

- Log in again to get a new token
- Tokens are only valid for 1 day

### Error: `UNIQUE constraint failed: users.email`

**Meaning:** The email is already registered.

**Solution:**

- Use a different email address when registering

---

## Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [JWT.io](https://jwt.io/)
- [Bun Official Documentation](https://bun.sh/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## Contributing

If you want to contribute or report a bug:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

MIT — free to use for both commercial and personal purposes.

---

## Contact

For questions or suggestions, please open an issue in the GitHub repository.

---