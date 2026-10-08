const express = require("express");

const {
  createTrainingSession,
  getTrainingSessionById,
} = require("../controllers/trainingSessionController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create a training session
router.post(
  "/",
  authenticateToken,
  createTrainingSession
);

// Retrieve a training session
router.get(
  "/:id",
  authenticateToken,
  getTrainingSessionById
);

module.exports = router;