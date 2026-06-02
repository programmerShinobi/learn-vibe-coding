import "dotenv/config";
import app from "./app";

// Read port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Start the Express HTTP server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
