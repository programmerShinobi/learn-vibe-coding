# Notes API

A RESTful API for managing notes with user authentication, built with **Bun**, **Express.js**, **Drizzle ORM**, and **MySQL**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.sh/) |
| Framework | [Express.js](https://expressjs.com/) v5 |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Database | MySQL 8+ |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |

---

## Project Structure

```
src/
├── app.ts                  # Express app setup (middleware, routes)
├── server.ts               # Server entry point with startup banner
├── config/
│   ├── db.config.ts        # Database connection config
│   └── jwt.config.ts       # JWT secret and expiration config
├── db/
│   └── index.ts            # Drizzle ORM client initialization
├── schema/
│   ├── auth.schema.ts      # Drizzle schema for `users` table
│   └── note.schema.ts      # Drizzle schema for `notes` table
├── repositories/
│   ├── auth.repository.ts  # Raw DB queries for users
│   └── note.repository.ts  # Raw DB queries for notes
├── services/
│   ├── auth.service.ts     # Auth business logic (hashing, JWT)
│   └── note.service.ts     # Note business logic
├── controllers/
│   ├── auth.controller.ts  # Auth request/response handlers
│   └── note.controller.ts  # Note request/response handlers
├── middlewares/
│   └── auth.middleware.ts  # JWT verification middleware
├── routes/
│   ├── auth.routes.ts      # Auth route definitions
│   ├── note.routes.ts      # Note route definitions
│   └── index.ts            # Route combiner
└── utils/
    └── jwt.utils.ts        # JWT sign/verify utility functions
```

---

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- MySQL 8+ running locally or via Docker

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/programmerShinobi/learn-vibe-coding.git
cd learn-vibe-coding
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Setup Environment Variables

Copy and configure the `.env` file:

```bash
cp .env.example .env
```

Then update `.env` with your credentials:

```env
DATABASE_URL="mysql://root:mysql@localhost:3306/vibe_db"
JWT_SECRET="replace-with-a-random-secret-of-at-least-32-chars"
PORT=3000
CORS_ORIGIN=
```

### 4. Setup MySQL Database

**Option A: Using Docker (recommended)**

```bash
sudo docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=mysql \
  -e MYSQL_DATABASE=vibe_db \
  -p 3306:3306 \
  mysql:8.0
```

**Option B: Using an existing MySQL instance**

Create the database manually:

```sql
CREATE DATABASE IF NOT EXISTS vibe_db;
```

### 5. Run Database Migrations

Push the schema to the database:

```bash
bun run db:push
```

### 6. Start the Development Server

```bash
bun run dev
```

You should see:

```
  ███╗   ██╗ ██████╗ ████████╗███████╗███████╗
  ████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝
  ██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗
  ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║
  ██║ ╚████║╚██████╔╝   ██║   ███████╗███████║
  ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝
            A P I   S E R V E R
  ─────────────────────────────────────────────
  ▶  Status   : Running
  ▶  Port     : http://localhost:3000
  ▶  Docs     : http://localhost:3000/api/v1
  ▶  Mode     : development
  ─────────────────────────────────────────────
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run test` | Run the isolated Bun test suite |
| `bun run typecheck` | Run TypeScript strict checks without emitting files |
| `bun run db:push` | Push Drizzle schema changes to database |
| `bun run db:generate` | Generate SQL migration files |
| `bun run db:migrate` | Apply committed Drizzle migrations |

---

## Database Schema

### `users` Table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password` | VARCHAR(255) | NOT NULL (bcrypt hash) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

### `notes` Table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT |
| `user_id` | INT | FOREIGN KEY → `users.id` |
| `title` | VARCHAR(255) | NOT NULL |
| `content` | TEXT | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

---

## API Reference

### Base URL

```
http://localhost:3000/api/v1
```

### Request Format

All request bodies must use **form-data** encoding:

```
Content-Type: application/x-www-form-urlencoded
```

### Response Format

All responses return JSON in the following structure:

```json
{
  "message": "Description of result",
  "data": { } // object, array, or null
}
```

---

### Authentication Endpoints

#### Register

```http
POST /api/v1/auth/register
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `email` | string | ✅ |
| `password` | string | ✅ |

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -d "name=John Doe&email=john@example.com&password=password123"
```

**Success Response `201`:**

```json
{
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2022-01-01T00:00:00.000Z",
    "updatedAt": "2022-01-01T00:00:00.000Z"
  }
}
```

**Error Response `400`:**

```json
{
  "message": "User already exists",
  "data": null
}
```

---

#### Login

```http
POST /api/v1/auth/login
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d "email=john@example.com&password=password123"
```

**Success Response `200`:**

```json
{
  "message": "User logged in successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2022-01-01T00:00:00.000Z",
    "updatedAt": "2022-01-01T00:00:00.000Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**Success Response `200`:**

```json
{
  "message": "User logged out successfully",
  "data": null
}
```

---

### Notes Endpoints

> All notes endpoints require an `Authorization: Bearer <token>` header.

#### Create Note

```http
POST /api/v1/notes
Authorization: Bearer <token>
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `content` | string | ✅ |

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Authorization: Bearer <token>" \
  -d "title=My Note&content=Hello World"
```

**Success Response `201`:**

```json
{
  "message": "Note created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "My Note",
    "content": "Hello World",
    "createdAt": "2022-01-01T00:00:00.000Z",
    "updatedAt": "2022-01-01T00:00:00.000Z"
  }
}
```

---

#### Get All Notes

```http
GET /api/v1/notes
Authorization: Bearer <token>
```

**Success Response `200`:**

```json
{
  "message": "Notes retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "My Note",
      "content": "Hello World",
      "createdAt": "2022-01-01T00:00:00.000Z",
      "updatedAt": "2022-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Note by ID

```http
GET /api/v1/notes/:id
Authorization: Bearer <token>
```

**Success Response `200`:**

```json
{
  "message": "Note retrieved successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "My Note",
    "content": "Hello World",
    "createdAt": "2022-01-01T00:00:00.000Z",
    "updatedAt": "2022-01-01T00:00:00.000Z"
  }
}
```

**Error Response `404`:**

```json
{
  "message": "Note not found",
  "data": null
}
```

---

#### Get Notes by User ID

```http
GET /api/v1/notes/user/:userId
Authorization: Bearer <token>
```

**Success Response `200`:**

```json
{
  "message": "Notes retrieved successfully",
  "data": [...]
}
```

---

#### Update Note

```http
PUT /api/v1/notes/:id
Authorization: Bearer <token>
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `title` | string | At least one |
| `content` | string | At least one |

**Example:**

```bash
curl -X PUT http://localhost:3000/api/v1/notes/1 \
  -H "Authorization: Bearer <token>" \
  -d "title=Updated Title&content=Updated content"
```

**Success Response `200`:**

```json
{
  "message": "Note updated successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Updated Title",
    "content": "Updated content",
    "createdAt": "2022-01-01T00:00:00.000Z",
    "updatedAt": "2022-01-02T00:00:00.000Z"
  }
}
```

---

#### Delete Note

```http
DELETE /api/v1/notes/:id
Authorization: Bearer <token>
```

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/v1/notes/1 \
  -H "Authorization: Bearer <token>"
```

**Success Response `200`:**

```json
{
  "message": "Note deleted successfully",
  "data": null
}
```

---

## Error Responses

| HTTP Status | When |
|------------|------|
| `400` | Missing/invalid request fields |
| `401` | Missing or invalid JWT token |
| `404` | Resource not found |
| `500` | Internal server error |

---

## License

MIT
