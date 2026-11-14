
const pool = require("../config/database");

// Retrieve training progress for the logged-in Sales Agent
const getMyTrainingProgress = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         ts.id AS session_id,
         ts.started_at,
         ts.completed_at,
         s.title AS scenario_title,
         e.overall_score::float8 AS overall_score,
         e.scores,
         e.model,
         e.created_at AS evaluated_at
       FROM training_sessions ts
       INNER JOIN training_scenarios s
         ON s.id = ts.scenario_id
       INNER JOIN training_session_evaluations e
         ON e.session_id = ts.id
       WHERE ts.user_id = $1
         AND ts.status = 'completed'
         AND COALESCE(e.model, '') NOT ILIKE '%mock%'
       ORDER BY
         COALESCE(ts.completed_at, e.created_at) DESC,
         ts.id DESC`,
      [req.user.id]
    );

    const practicedSkills = new Set();

    const sessions = result.rows.map((row) => {
      let scores = row.scores;

      // Handle scores stored as JSON strings
      if (typeof scores === "string") {
        try {
          scores = JSON.parse(scores);
        } catch {
          scores = {};
        }
      }

      if (
        !scores ||
        typeof scores !== "object" ||
        Array.isArray(scores)
      ) {
        scores = {};
      }

      // Count distinct competencies actually assessed
      for (const [name, score] of Object.entries(scores)) {
        if (
          typeof score === "number" &&
          Number.isFinite(score)
        ) {
          practicedSkills.add(name);
        }
      }

      return {
        id: row.session_id,
        scenario: row.scenario_title,
        completedAt:
          row.completed_at || row.evaluated_at,
        startedAt: row.started_at,
        overallScore: row.overall_score,
        scores,
        model: row.model,
      };
    });

    return res.status(200).json({
      completedSessions: sessions.length,
      skillsPracticed: practicedSkills.size,
      skillNames: [...practicedSkills].sort(),
      sessions,
    });

  } catch (error) {
    console.error("Get training progress error:", error);

    return res.status(500).json({
      message: "Unable to load training progress",
    });
  }
};

module.exports = {
  getMyTrainingProgress,
};
