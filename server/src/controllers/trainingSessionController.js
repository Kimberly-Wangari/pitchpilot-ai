//const pool = require("../config/database");

// Create a new training session
/*const createTrainingSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scenarioId } = req.body;

    if (!scenarioId) {
      return res.status(400).json({
        message: "Scenario ID is required",
      });
    }

    // Confirm that the scenario exists and is active
    const scenarioResult = await pool.query(
      `SELECT id, title
       FROM training_scenarios
       WHERE id = $1 AND is_active = TRUE`,
      [scenarioId]
    );

    if (scenarioResult.rows.length === 0) {
      return res.status(404).json({
        message: "Training scenario not found",
      });
    }

    const sessionResult = await pool.query(
      `INSERT INTO training_sessions
        (user_id, scenario_id, status)
       VALUES ($1, $2, 'in_progress')
       RETURNING
         id,
         user_id,
         scenario_id,
         status,
         started_at,
         created_at`,
      [userId, scenarioId]
    );

    return res.status(201).json({
      message: "Training session created successfully",
      session: sessionResult.rows[0],
    });
  } catch (error) {
    console.error("Create training session error:", error);

    return res.status(500).json({
      message: "Unable to create training session",
    });
  }
};

const getTrainingSessionById = async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({
        message: "Invalid training session ID",
      });
    }

    const result = await pool.query(
      `
      SELECT
        ts.id,
        ts.user_id,
        ts.scenario_id,
        ts.status,
        ts.started_at,
        ts.completed_at,
        s.title,
        s.description,
        s.category,
        s.difficulty,
        s.customer_persona,
        s.situation,
        s.objective,
        s.target_competencies
      FROM training_sessions ts
      INNER JOIN training_scenarios s
        ON ts.scenario_id = s.id
      WHERE ts.id = $1
        AND ts.user_id = $2
      `,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Training session not found",
      });
    }

    return res.status(200).json({
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Get training session error:", error);

    return res.status(500).json({
      message: "Unable to retrieve training session",
    });
  }
};

module.exports = {
  createTrainingSession,
  getTrainingSessionById,
}; */

const pool = require("../config/database");

const SUPPORTED_SCENARIOS = {
  "Handling a Price Objection": [
    "Communication Clarity",
    "Objection Handling",
    "Value Communication",
  ],
  "Competitor Comparison": [
    "Needs Discovery",
    "Persuasive Communication",
    "Competitive Positioning",
  ],
  "Discovering Customer Needs": [
    "Active Listening",
    "Questioning",
    "Customer Engagement",
  ],
  "Handling a Hesitant Decision Maker": [
    "Objection Handling",
    "Customer Engagement",
    "Closing Skills",
    "Persuasive Communication",
  ],
};

const positiveId = (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
};

// Create a new training session
const createTrainingSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const scenarioId = positiveId(req.body?.scenarioId);

    if (!scenarioId) {
      return res.status(400).json({
        message: "A valid scenario ID is required",
      });
    }

    const scenarioResult = await pool.query(
      `SELECT id, title
       FROM training_scenarios
       WHERE id = $1 AND is_active = TRUE`,
      [scenarioId]
    );

    if (scenarioResult.rows.length === 0) {
      return res.status(404).json({
        message: "Training scenario not found",
      });
    }

    const sessionResult = await pool.query(
      `INSERT INTO training_sessions
         (user_id, scenario_id, status)
       VALUES ($1, $2, 'in_progress')
       RETURNING
         id, user_id, scenario_id, status,
         started_at, created_at`,
      [userId, scenarioId]
    );

    return res.status(201).json({
      message: "Training session created successfully",
      session: sessionResult.rows[0],
    });
  } catch (error) {
    console.error("Create training session error:", error);

    return res.status(500).json({
      message: "Unable to create training session",
    });
  }
};

// Retrieve a training session
const getTrainingSessionById = async (req, res) => {
  try {
    const sessionId = positiveId(req.params.id);

    if (!sessionId) {
      return res.status(400).json({
        message: "Invalid training session ID",
      });
    }

    const result = await pool.query(
      `SELECT
          ts.id,
          ts.user_id,
          ts.scenario_id,
          ts.status,
          ts.started_at,
          ts.completed_at,
          s.title,
          s.description,
          s.category,
          s.difficulty,
          s.customer_persona,
          s.situation,
          s.objective,
          s.target_competencies
       FROM training_sessions ts
       INNER JOIN training_scenarios s
         ON ts.scenario_id = s.id
       WHERE ts.id = $1
         AND ts.user_id = $2`,
      [sessionId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Training session not found",
      });
    }

    return res.status(200).json({
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Get training session error:", error);

    return res.status(500).json({
      message: "Unable to retrieve training session",
    });
  }
};

// Validate AI-generated performance scores
function validateEvaluation(data, skillNames) {
  if (
    !data ||
    typeof data !== "object" ||
    !data.scores ||
    typeof data.scores !== "object"
  ) {
    throw new Error(
      "Evaluation response does not contain scores"
    );
  }

  const scores = {};

  for (const skill of skillNames) {
    if (
      !Object.prototype.hasOwnProperty.call(
        data.scores,
        skill
      )
    ) {
      throw new Error(
        `Evaluation is missing score: ${skill}`
      );
    }

    const value = data.scores[skill];

    if (
      value !== null &&
      (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 5
      )
    ) {
      throw new Error(
        `Invalid evaluation score: ${skill}`
      );
    }

    scores[skill] = value;
  }

  for (const field of ["strengths", "improvements"]) {
    if (
      !Array.isArray(data[field]) ||
      !data[field].every(
        (item) => typeof item === "string"
      )
    ) {
      throw new Error(`Invalid evaluation ${field}`);
    }
  }

  if (
    typeof data.feedback !== "string" ||
    !data.feedback.trim()
  ) {
    throw new Error("Evaluation feedback is missing");
  }

  const assessed = Object.values(scores).filter(
    (value) => value !== null
  );

  if (assessed.length === 0) {
    throw new Error(
      "Not enough evidence to assess any competency"
    );
  }

  const total = assessed.reduce(
    (sum, value) => sum + value,
    0
  );

  const overallScore = Math.round(
    (total / (assessed.length * 5)) * 10000
  ) / 100;

  return {
    scores,
    overallScore,
    assessedCompetencies: assessed.length,
    strengths: data.strengths.slice(0, 5),
    improvements: data.improvements.slice(0, 5),
    feedback: data.feedback.trim(),
    model:
      typeof data.model === "string"
        ? data.model
        : "unknown",
  };
}

// Complete and evaluate a training session
const endAndEvaluateTrainingSession = async (req, res) => {
  const sessionId = positiveId(req.params.id);

  if (!sessionId) {
    return res.status(400).json({
      message: "Invalid training session ID",
    });
  }

  const evaluationUrl =
    process.env.PITCHPILOT_EVALUATION_URL;

  const apiKey =
    process.env.PITCHPILOT_INFERENCE_API_KEY;

  if (!evaluationUrl || !apiKey) {
    return res.status(503).json({
      message: "AI evaluation endpoint is not configured",
    });
  }

  try {
    const url = new URL(evaluationUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return res.status(503).json({
      message: "Invalid AI evaluation endpoint URL",
    });
  }

  try {
    // Verify session ownership
    const sessionResult = await pool.query(
      `SELECT
          ts.id,
          ts.status,
          s.title,
          s.customer_persona,
          s.objective
       FROM training_sessions ts
       INNER JOIN training_scenarios s
         ON s.id = ts.scenario_id
       WHERE ts.id = $1
         AND ts.user_id = $2`,
      [sessionId, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Training session not found",
      });
    }

    const session = sessionResult.rows[0];

    if (session.status !== "in_progress") {
      return res.status(409).json({
        message: "Only active sessions can be evaluated",
      });
    }

    const skillNames =
      SUPPORTED_SCENARIOS[session.title];

    if (!skillNames) {
      return res.status(422).json({
        message:
          "This scenario does not have an evaluation rubric yet",
      });
    }

    // Retrieve saved conversation history
    const messageResult = await pool.query(
      `SELECT id, sender, content
       FROM (
         SELECT id, sender, content
         FROM conversation_messages
         WHERE session_id = $1
           AND sender IN ('agent', 'customer')
         ORDER BY id DESC
         LIMIT 30
       ) recent
       ORDER BY id ASC`,
      [sessionId]
    );

    const rows = messageResult.rows;

    const hasAgent = rows.some(
      (message) => message.sender === "agent"
    );

    const hasCustomer = rows.some(
      (message) => message.sender === "customer"
    );

    if (!hasAgent || !hasCustomer) {
      return res.status(422).json({
        message:
          "Have a conversation with the customer before ending and evaluating this session",
      });
    }

    const lastMessageId =
      rows[rows.length - 1].id;

    const messages = rows.map((message) => ({
      sender: message.sender,
      content: String(message.content).slice(0, 4000),
    }));

    // Call the inference evaluation API
    let response;

    try {
      response = await fetch(evaluationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          scenario: session.title,
          persona: String(
            session.customer_persona ||
              "A prospective customer"
          ).slice(0, 6000),
          objective: String(
            session.objective ||
              "Practice sales communication"
          ).slice(0, 2000),
          messages,
        }),
        signal: AbortSignal.timeout(180000),
      });
    } catch (error) {
      console.error(
        "AI evaluation connection failed:",
        error.message
      );

      return res.status(
        error.name === "TimeoutError" ? 504 : 502
      ).json({
        message:
          "AI evaluation is currently unavailable. Your session is still active.",
      });
    }

    if (!response.ok) {
      console.error(
        "AI evaluation HTTP status:",
        response.status
      );

      return res.status(502).json({
        message:
          "AI evaluation failed. Your session is still active.",
      });
    }

    let evaluation;

    try {
      const data = await response.json();

      evaluation = validateEvaluation(
        data,
        skillNames
      );
    } catch (error) {
      console.error(
        "Invalid AI evaluation:",
        error.message
      );

      return res.status(502).json({
        message:
          "AI returned invalid evaluation data. Your session is still active.",
      });
    }

    // Save feedback and complete the session atomically
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const locked = await client.query(
        `SELECT status
         FROM training_sessions
         WHERE id = $1
           AND user_id = $2
         FOR UPDATE`,
        [sessionId, req.user.id]
      );

      if (
        locked.rows.length === 0 ||
        locked.rows[0].status !== "in_progress"
      ) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          message: "This session is no longer active",
        });
      }

      // Ensure conversation has not changed during evaluation
      const newest = await client.query(
        `SELECT MAX(id) AS latest_id
         FROM conversation_messages
         WHERE session_id = $1
           AND sender IN ('agent', 'customer')`,
        [sessionId]
      );

      if (
        String(newest.rows[0].latest_id) !==
        String(lastMessageId)
      ) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          message:
            "New messages arrived during evaluation. Please evaluate again.",
        });
      }

      const saved = await client.query(
        `INSERT INTO training_session_evaluations
          (
            session_id,
            scores,
            overall_score,
            assessed_competencies,
            strengths,
            improvements,
            feedback,
            model,
            evaluated_message_count
          )
         VALUES
          (
            $1,
            $2::jsonb,
            $3,
            $4,
            $5::jsonb,
            $6::jsonb,
            $7,
            $8,
            $9
          )
         RETURNING
            session_id,
            scores,
            overall_score::float8 AS overall_score,
            assessed_competencies,
            strengths,
            improvements,
            feedback,
            model,
            evaluated_message_count,
            created_at`,
        [
          sessionId,
          JSON.stringify(evaluation.scores),
          evaluation.overallScore,
          evaluation.assessedCompetencies,
          JSON.stringify(evaluation.strengths),
          JSON.stringify(evaluation.improvements),
          evaluation.feedback,
          evaluation.model,
          Math.min(15, messages.length),
        ]
      );

      await client.query(
        `UPDATE training_sessions
         SET
           status = 'completed',
           completed_at = NOW()
         WHERE id = $1
           AND user_id = $2`,
        [sessionId, req.user.id]
      );

      await client.query("COMMIT");

      return res.status(200).json({
        message:
          "Session completed and feedback saved",
        evaluation: saved.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      "End and evaluate session error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to complete the training evaluation",
    });
  }
};

// Retrieve saved training feedback
const getTrainingSessionEvaluation = async (req, res) => {
  const sessionId = positiveId(req.params.id);

  if (!sessionId) {
    return res.status(400).json({
      message: "Invalid training session ID",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
          e.session_id,
          e.scores,
          e.overall_score::float8 AS overall_score,
          e.assessed_competencies,
          e.strengths,
          e.improvements,
          e.feedback,
          e.model,
          e.evaluated_message_count,
          e.created_at
       FROM training_session_evaluations e
       INNER JOIN training_sessions ts
         ON ts.id = e.session_id
       WHERE ts.id = $1
         AND ts.user_id = $2`,
      [sessionId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "No saved evaluation for this session",
      });
    }

    return res.status(200).json({
      evaluation: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get training evaluation error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve training evaluation",
    });
  }
};

module.exports = {
  createTrainingSession,
  getTrainingSessionById,
  endAndEvaluateTrainingSession,
  getTrainingSessionEvaluation,
};
