
const pool = require("../config/database");

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

// Only genuine AI scores count toward performance.
// Mock evaluations remain visible as test data.
const REAL_SCORE_FILTER =
  "e.model NOT ILIKE '%mock%'";

// ============================================
// GET MANAGER OVERVIEW
// ============================================

async function getOverview(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(DISTINCT u.id)::int AS total_agents,

         COUNT(ts.id) FILTER (
           WHERE ts.status = 'completed'
         )::int AS completed_simulations,

         COUNT(ts.id) FILTER (
           WHERE ts.status = 'in_progress'
         )::int AS active_simulations,

         ROUND(
           AVG(e.overall_score) FILTER (
             WHERE ts.status = 'completed'
               AND ${REAL_SCORE_FILTER}
           ),
           2
         ) AS average_score,

         COUNT(e.session_id) FILTER (
           WHERE ts.status = 'completed'
             AND ${REAL_SCORE_FILTER}
         )::int AS evaluated_simulations

       FROM users u

       LEFT JOIN training_sessions ts
         ON ts.user_id = u.id

       LEFT JOIN training_session_evaluations e
         ON e.session_id = ts.id

       WHERE u.manager_id = $1
         AND u.role = 'agent'
         AND u.is_active = TRUE`,
      [req.user.id]
    );

    const row = result.rows[0];

    return res.status(200).json({
      overview: {
        totalAgents: row.total_agents,

        simulationsCompleted:
          row.completed_simulations,

        activeSimulations:
          row.active_simulations,

        averageScore:
          row.average_score === null
            ? null
            : Number(row.average_score),

        evaluatedSimulations:
          row.evaluated_simulations,

        scoreChange: null,
        simulationsChange: null,
        skillGaps: [],
      },
    });
  } catch (error) {
    console.error("Manager overview error:", error);

    return res.status(500).json({
      message:
        "Unable to retrieve manager overview.",
    });
  }
}

// ============================================
// GET ASSIGNED SALES AGENTS
// ============================================

async function getAgents(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.first_name,
         u.last_name,
         u.email,

         COUNT(ts.id) FILTER (
           WHERE ts.status = 'completed'
         )::int AS completed,

         COUNT(ts.id) FILTER (
           WHERE ts.status = 'in_progress'
         )::int AS in_progress,

         MAX(ts.started_at) AS last_activity,

         latest.score AS recent_score

       FROM users u

       LEFT JOIN training_sessions ts
         ON ts.user_id = u.id

       LEFT JOIN LATERAL (
         SELECT
           e.overall_score::float8 AS score
         FROM training_sessions recent_ts

         JOIN training_session_evaluations e
           ON e.session_id = recent_ts.id

         WHERE recent_ts.user_id = u.id
           AND recent_ts.status = 'completed'
           AND e.model NOT ILIKE '%mock%'

         ORDER BY
           recent_ts.completed_at DESC NULLS LAST,
           recent_ts.id DESC

         LIMIT 1
       ) latest ON TRUE

       WHERE u.manager_id = $1
         AND u.role = 'agent'
         AND u.is_active = TRUE

       GROUP BY u.id, latest.score

       ORDER BY
         u.first_name,
         u.last_name,
         u.id`,
      [req.user.id]
    );

    const agents = result.rows.map((row) => ({
      id: row.id,

      name:
        `${row.first_name} ${row.last_name}`,

      email: row.email,

      title: "Sales Agent",

      initials:
        `${row.first_name?.[0] || ""}${
          row.last_name?.[0] || ""
        }`.toUpperCase(),

      completed: row.completed,

      inProgress: row.in_progress,

      lastActivity: row.last_activity,

      score:
        row.recent_score === null
          ? null
          : Number(row.recent_score),

      trend: null,
      skills: null,
    }));

    return res.status(200).json({
      agents,
    });
  } catch (error) {
    console.error("Manager agents error:", error);

    return res.status(500).json({
      message: "Unable to retrieve agents.",
    });
  }
}

// ============================================
// GET AN ASSIGNED AGENT'S REPORT
// ============================================

async function getAgentReport(req, res) {
  const agentId = validId(req.params.id);

  if (!agentId) {
    return res.status(400).json({
      message: "Invalid agent ID.",
    });
  }

  try {
    // Check that the Agent belongs to
    // the currently authenticated Manager.
    const access = await pool.query(
      `SELECT
         id,
         first_name,
         last_name,
         email
       FROM users
       WHERE id = $1
         AND manager_id = $2
         AND role = 'agent'
         AND is_active = TRUE`,
      [agentId, req.user.id]
    );

    if (!access.rowCount) {
      return res.status(404).json({
        message:
          "Agent not found or not assigned to you.",
      });
    }

    // Retrieve saved training sessions and
    // their evaluations.
    const history = await pool.query(
      `SELECT
         ts.id,
         ts.status,
         ts.started_at,
         ts.completed_at,

         s.title AS scenario_title,

         e.overall_score::float8 AS overall_score,
         e.scores,
         e.strengths,
         e.improvements,
         e.feedback,
         e.model

       FROM training_sessions ts

       JOIN users u
         ON u.id = ts.user_id

       JOIN training_scenarios s
         ON s.id = ts.scenario_id

       LEFT JOIN training_session_evaluations e
         ON e.session_id = ts.id

       WHERE ts.user_id = $1
         AND u.manager_id = $2
         AND u.role = 'agent'
         AND u.is_active = TRUE

       ORDER BY
         ts.started_at DESC,
         ts.id DESC

       LIMIT 100`,
      [agentId, req.user.id]
    );

    const user = access.rows[0];
    const sessions = history.rows;

    // Find the latest genuine AI assessment.
    const recentReal = sessions.find(
      (session) =>
        session.overall_score !== null &&
        session.model &&
        !session.model
          .toLowerCase()
          .includes("mock")
    );

    return res.status(200).json({
      agent: {
        id: user.id,

        name:
          `${user.first_name} ${user.last_name}`,

        email: user.email,

        score:
          recentReal?.overall_score ?? null,

        skills:
          recentReal?.scores ?? null,
      },

      sessions,
    });
  } catch (error) {
    console.error("Manager report error:", error);

    return res.status(500).json({
      message:
        "Unable to retrieve agent report.",
    });
  }
}

module.exports = {
  getOverview,
  getAgents,
  getAgentReport,
};
