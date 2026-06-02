import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

/**
 * Elysia Web Server Entry Point
 * 
 * This file initializes the Elysia web framework instance, configures port/host,
 * defines the API routes, and integrates our Drizzle ORM database client.
 */

// Define the port number our server will listen on
const PORT = process.env.PORT || 3000;

const app = new Elysia()
  // 1. Health-check route (GET /)
  // Simply returns a static message to verify the server is running.
  .get("/", () => {
    return {
      status: "ok",
      message: "Elysia server is running and healthy",
      timestamp: new Date().toISOString(),
    };
  })

  // 2. Fetch all users route (GET /users)
  // Queries all records from the 'users' table using Drizzle ORM.
  .get("/users", async () => {
    try {
      // db.select() starts a SELECT query.
      // .from(users) specifies the target table.
      const allUsers = await db.select().from(users);
      return {
        success: true,
        data: allUsers,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: "Failed to fetch users from database",
      };
    }
  })

  // 3. Create a user route (POST /users)
  // Validates input body and inserts a new record into the database.
  .post(
    "/users",
    async ({ body }) => {
      try {
        const { name, email } = body;

        // db.insert(users) starts an INSERT query.
        // .values(...) inserts the provided user details.
        // For MySQL, the auto-increment 'id' is generated automatically.
        await db.insert(users).values({
          name,
          email,
        });

        return {
          success: true,
          message: "User created successfully",
        };
      } catch (error: any) {
        console.error("Error creating user:", error);
        
        // Handle duplicate key errors (e.g. duplicate email)
        if (error.code === "ER_DUP_ENTRY") {
          return {
            success: false,
            error: "Email already exists",
          };
        }

        return {
          success: false,
          error: "Failed to create user",
        };
      }
    },
    {
      // Elysia uses TypeBox for schema validation.
      // This ensures we only receive valid string inputs for name and email.
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
      }),
    }
  )

  // Start listening for incoming HTTP requests on the specified port.
  .listen(PORT);

console.log(
  `🚀 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`
);
