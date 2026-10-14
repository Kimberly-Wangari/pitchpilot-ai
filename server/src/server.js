
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const scenarioRoutes = require("./routes/scenarioRoutes");
const authRoutes = require("./routes/authRoutes");
const trainingSessionRoutes = require("./routes/trainingSessionRoutes");
const oauthRoutes = require("./routes/oauthRoutes");
const managerRoutes = require("./routes/managerRoutes");

const pool = require("./config/database");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser(process.env.OAUTH_COOKIE_SECRET));

// Existing application routes
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/training-sessions", trainingSessionRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/manager", managerRoutes);
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
  console.log(
    `PitchPilot AI API running on http://localhost:${PORT}`
  );
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
