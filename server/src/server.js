
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Database
const pool = require("./config/database");

// Routes
const authRoutes = require("./routes/authRoutes");
const scenarioRoutes = require("./routes/scenarioRoutes");
const trainingSessionRoutes = require("./routes/trainingSessionRoutes");
const oauthRoutes = require("./routes/oauthRoutes");
const managerRoutes = require("./routes/managerRoutes");
const simulationRoutes = require("./routes/simulationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const managerAccessRoutes = require("./routes/managerAccessRoutes");


const app = express();

// MIDDLEWARE

// Allow requests from the React frontend.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming requests.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Parse cookies used by OAuth authentication.
app.use(cookieParser(process.env.OAUTH_COOKIE_SECRET));


// API ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/training-sessions", trainingSessionRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manager-access", managerAccessRoutes);

// Fine-tuned Llama customer simulation.
app.use("/api/simulation", simulationRoutes);

// HEALTH CHECK


app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "PitchPilot AI Backend",
  });
});

// DATABASE HEALTH CHECK

app.get("/api/database-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// HANDLE UNKNOWN ROUTES

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found.",
  });
});


// START SERVER

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `PitchPilot AI API running on http://localhost:${PORT}`
  );
});

server.on("error", (error) => {
  console.error("Unable to start backend:", error);
  process.exit(1);
});

module.exports = app;
