const express = require("express");

const {
  createTrainingSession,
  getTrainingSessionById,
} = require("../controllers/trainingSessionController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

const {
  getConversationMessages,
  sendConversationMessage,
} = require("../controllers/conversationController");
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
module.exports = router;