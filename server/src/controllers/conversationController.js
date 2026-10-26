
const pool = require("../config/database");

const MAX_MESSAGE_LENGTH = 4000;
const MODEL_TIMEOUT_MS = 120000;

function formatContext(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return JSON.stringify(value);
}

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

    const sessionResult = await pool.query(
      `SELECT id FROM training_sessions
       WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Training session not found",
      });
    }

    const result = await pool.query(
      `SELECT id, session_id, sender, content, created_at
       FROM conversation_messages
       WHERE session_id = $1
       ORDER BY id ASC`,
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

// Send a message and generate the AI customer's reply
const sendConversationMessage = async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const userId = req.user.id;
  const message = req.body?.message;

  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
    return res.status(400).json({
      message: "Invalid training session ID",
    });
  }

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.trim().length > MAX_MESSAGE_LENGTH
  ) {
    return res.status(400).json({
      message: `Message must contain between 1 and ${MAX_MESSAGE_LENGTH} characters`,
    });
  }

  const endpoint = process.env.PITCHPILOT_INFERENCE_URL;
  const apiKey = process.env.PITCHPILOT_INFERENCE_API_KEY;

  if (!endpoint || !apiKey) {
    return res.status(503).json({
      message: "The AI customer is not configured yet.",
    });
  }

  let url;

  try {
    url = new URL(endpoint);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Unsupported URL protocol");
    }
  } catch {
    return res.status(503).json({
      message: "Invalid model endpoint configuration.",
    });
  }

  try {
    // Verify ownership and active session status
    const sessionResult = await pool.query(
      `SELECT * FROM training_sessions
       WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Training session not found",
      });
    }

    const session = sessionResult.rows[0];

    if (session.status !== "in_progress") {
      return res.status(409).json({
        message: "Cannot send messages to an inactive training session",
      });
    }

    // Obtain the customer persona and scenario details
    let scenario = session;

    const scenarioId =
      session.scenario_id ?? session.training_scenario_id;

    if (scenarioId != null) {
      const scenarioResult = await pool.query(
        `SELECT * FROM training_scenarios
         WHERE id = $1`,
        [scenarioId]
      );

      if (scenarioResult.rows.length > 0) {
        scenario = scenarioResult.rows[0];
      }
    }

    const persona = [
      formatContext(
        scenario.customer_persona || session.customer_persona
      ) ||
        "You are a realistic prospective customer in a sales training simulation.",

      scenario.situation || session.situation
        ? `Situation: ${formatContext(
            scenario.situation || session.situation
          )}`
        : "",

      scenario.objective || session.objective
        ? `Sales agent objective: ${formatContext(
            scenario.objective || session.objective
          )}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 3000);

    // Retrieve the most recent conversation history
    const historyResult = await pool.query(
      `SELECT sender, content
       FROM conversation_messages
       WHERE session_id = $1
         AND sender IN ('agent', 'customer')
       ORDER BY id DESC
       LIMIT 20`,
      [sessionId]
    );

    const history = historyResult.rows
      .reverse()
      .map((item) => ({
        role: item.sender === "agent" ? "user" : "assistant",
        content: String(item.content).slice(
          0,
          MAX_MESSAGE_LENGTH
        ),
      }));

    // Generate the simulated customer's response
    let modelResponse;

    try {
      modelResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          persona,
          message: message.trim(),
          history,
        }),
        signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
      });
    } catch (error) {
      console.error("Model connection error:", error.message);

      return res.status(
        error.name === "TimeoutError" ? 504 : 502
      ).json({
        message:
          "The AI customer is temporarily unreachable. Your message was not saved.",
      });
    }

    if (!modelResponse.ok) {
      console.error(
        "Model API returned status:",
        modelResponse.status
      );

      return res.status(502).json({
        message:
          "The AI customer could not generate a response.",
      });
    }

    let generated;

    try {
      generated = await modelResponse.json();
    } catch {
      return res.status(502).json({
        message: "The AI customer returned an invalid response.",
      });
    }

    const customerReply = generated?.customer_response;

    if (
      typeof customerReply !== "string" ||
      !customerReply.trim()
    ) {
      return res.status(502).json({
        message: "The AI customer returned an empty response.",
      });
    }

    // Save agent and customer messages in one transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const locked = await client.query(
        `SELECT status FROM training_sessions
         WHERE id = $1 AND user_id = $2
         FOR UPDATE`,
        [sessionId, userId]
      );

      if (
        locked.rows.length === 0 ||
        locked.rows[0].status !== "in_progress"
      ) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          message: "The training session is no longer active.",
        });
      }

      const savedAgent = await client.query(
        `INSERT INTO conversation_messages
           (session_id, sender, content)
         VALUES ($1, 'agent', $2)
         RETURNING id, session_id, sender, content, created_at`,
        [sessionId, message.trim()]
      );

      const savedCustomer = await client.query(
        `INSERT INTO conversation_messages
           (session_id, sender, content)
         VALUES ($1, 'customer', $2)
         RETURNING id, session_id, sender, content, created_at`,
        [sessionId, customerReply.trim()]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message:
          "Agent and AI customer messages saved successfully",
        conversationMessage: savedAgent.rows[0],
        customerMessage: savedCustomer.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
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
