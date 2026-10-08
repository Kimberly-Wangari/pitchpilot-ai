const pool = require("../config/database");

// Create a new training session
const createTrainingSession = async (req, res) => {
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
};