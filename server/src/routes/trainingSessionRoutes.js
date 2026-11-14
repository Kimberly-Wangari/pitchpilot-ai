
const express = require("express");

const {
  createTrainingSession,
  getTrainingSessionById,
  endAndEvaluateTrainingSession,
  getTrainingSessionEvaluation,
} = require("../controllers/trainingSessionController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  getConversationMessages,
  sendConversationMessage,
} = require("../controllers/conversationController");

const {
  getMyTrainingProgress,
} = require("../controllers/trainingProgressController");

const router = express.Router();

// Create a training session
router.post(
  "/",
  authenticateToken,
  createTrainingSession
);

// Get the logged-in Sales Agent's progress
// IMPORTANT: Keep this BEFORE /:id
router.get(
  "/my-progress",
  authenticateToken,
  getMyTrainingProgress
);

// Retrieve a training session
router.get(
  "/:id",
  authenticateToken,
  getTrainingSessionById
);

// Retrieve conversation history
router.get(
  "/:sessionId/messages",
  authenticateToken,
  getConversationMessages
);

// Send a message to the AI customer
router.post(
  "/:sessionId/messages",
  authenticateToken,
  sendConversationMessage
);

// End session and generate performance evaluation
router.post(
  "/:id/end-and-evaluate",
  authenticateToken,
  endAndEvaluateTrainingSession
);

// Retrieve saved evaluation
router.get(
  "/:id/evaluation",
  authenticateToken,
  getTrainingSessionEvaluation
);

module.exports = router;
