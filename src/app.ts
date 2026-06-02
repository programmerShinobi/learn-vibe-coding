import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();

// Enable CORS for all origins (configure for production as needed)
app.use(cors());

// Parse application/x-www-form-urlencoded (form-data) request bodies
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies as well (for flexibility)
app.use(express.json());

// Mount all API routes under /api/v1
app.use("/api/v1", routes);

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({ message: "Notes API is running", data: null });
});

// Global 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found", data: null });
});

export default app;
