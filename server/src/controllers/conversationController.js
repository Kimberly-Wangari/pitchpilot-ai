const pool = require("../config/database");

// Retrieve messages for a training session
const getConversationMessages = async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);
    const userId = req.user.id;

    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({
        message: "Invalid training session ID",
      });
    }

    // Verify that the session belongs to the logged-in user
    const sessionResult = await pool.query(
      `
      SELECT id
      FROM training_sessions
      WHERE id = $1 AND user_id = $2
      `,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Training session not found",
      });
    }

    const result = await pool.query(
      `
      SELECT id, session_id, sender, content, created_at
      FROM conversation_messages
      WHERE session_id = $1
      ORDER BY id ASC
      `,
      [sessionId]
    );

    return res.status(200).json({
      messages: result.rows,
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);

    return res.status(500).json({
      message: "Unable to retrieve conversation messages",
    });
  }
};

// Save a sales agent's message
const sendConversationMessage = async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);
    const userId = req.user.id;
    const { message } = req.body || {};

    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({
        message: "Invalid training session ID",
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 5000
    ) {
      return res.status(400).json({
        message: "Message must contain between 1 and 5000 characters",
      });
    }

    // Check that the session belongs to the agent and is active
    const sessionResult = await pool.query(
      `
      SELECT id, status
      FROM training_sessions
      WHERE id = $1 AND user_id = $2
      `,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Training session not found",
      });
    }

    if (sessionResult.rows[0].status !== "in_progress") {
      return res.status(409).json({
        message: "Cannot send messages to an inactive training session",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO conversation_messages
        (session_id, sender, content)
      VALUES ($1, $2, $3)
      RETURNING id, session_id, sender, content, created_at
      `,
      [sessionId, "agent", message.trim()]
    );

    return res.status(201).json({
      message: "Message saved successfully",
      conversationMessage: result.rows[0],
    });
  } catch (error) {
    console.error("Send conversation message error:", error);

    return res.status(500).json({
      message: "Unable to send conversation message",
    });
  }
};

module.exports = {
  getConversationMessages,
  sendConversationMessage,
};