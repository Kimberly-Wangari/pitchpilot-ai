const express = require("express");
const cors = require("cors");
const scenarioRoutes = require("./routes/scenarioRoutes");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const trainingSessionRoutes = require("./routes/trainingSessionRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// Scenario routes
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/training-sessions", trainingSessionRoutes);




const pool = require("./config/database");


// API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "PitchPilot AI API",
  });
});

// Database health check
app.get("/api/database-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`PitchPilot AI API running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});