
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

// Retrieve conversation history
router.get(
  "/:sessionId/messages",
  authenticateToken,
  getConversationMessages
);

// Send a message during training
router.post(
  "/:sessionId/messages",
  authenticateToken,
  sendConversationMessage
);

// End a session and generate feedback
router.post(
  "/:id/end-and-evaluate",
  authenticateToken,
  endAndEvaluateTrainingSession
);

// Retrieve saved performance feedback
router.get(
  "/:id/evaluation",
  authenticateToken,
  getTrainingSessionEvaluation
);

module.exports = router;
