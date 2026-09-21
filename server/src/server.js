const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "PitchPilot AI API is running",
    status: "success",
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "PitchPilot AI API",
  });
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`PitchPilot AI API running on http://localhost:${PORT}`);
});