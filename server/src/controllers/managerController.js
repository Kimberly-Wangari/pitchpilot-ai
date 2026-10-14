
const pool = require("../config/database");

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function getOverview(req, res) {
  try {
    const managerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        COUNT(DISTINCT ma.agent_id)::int AS total_agents,
        COUNT(ts.id) FILTER (
          WHERE ts.status = 'completed'
        )::int AS completed_simulations,
        COUNT(ts.id) FILTER (
          WHERE ts.status = 'in_progress'
        )::int AS active_simulations
      FROM manager_agents ma
      JOIN users u
        ON u.id = ma.agent_id
        AND u.role = 'agent'
        AND u.is_active = TRUE
      LEFT JOIN training_sessions ts
        ON ts.user_id = ma.agent_id
      WHERE ma.manager_id = $1
      `,
      [managerId]
    );

    return res.json({
      overview: {
        totalAgents: result.rows[0].total_agents,
        simulationsCompleted:
          result.rows[0].completed_simulations,
        activeSimulations:
          result.rows[0].active_simulations,
        averageScore: null,
        scoreChange: null,
        simulationsChange: null,
        skillGaps: [],
      },
    });
  } catch (error) {
    console.error("Manager overview error:", error);
    return res.status(500).json({
      message: "Unable to retrieve manager overview.",
    });
  }
}

async function getAgents(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
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
        MAX(ts.started_at) AS last_activity
      FROM manager_agents ma
      JOIN users u
        ON u.id = ma.agent_id
      LEFT JOIN training_sessions ts
        ON ts.user_id = u.id
      WHERE ma.manager_id = $1
        AND u.role = 'agent'
        AND u.is_active = TRUE
      GROUP BY
        u.id, u.first_name, u.last_name, u.email
      ORDER BY u.first_name, u.last_name
      `,
      [req.user.id]
    );

    const agents = result.rows.map((row) => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      title: "Sales Agent",
      initials:
        `${row.first_name[0]}${row.last_name[0]}`.toUpperCase(),
      completed: row.completed,
      inProgress: row.in_progress,
      lastActivity: row.last_activity,
      score: null,
      trend: null,
      skills: null,
    }));

    return res.json({ agents });
  } catch (error) {
    console.error("Manager agents error:", error);
    return res.status(500).json({
      message: "Unable to retrieve agents.",
    });
  }
}

async function getAgentReport(req, res) {
  try {
    const agentId = validId(req.params.id);

    if (!agentId) {
      return res.status(400).json({
        message: "Invalid agent ID.",
      });
    }

    const access = await pool.query(
      `
      SELECT
        u.id, u.first_name, u.last_name, u.email
      FROM manager_agents ma
      JOIN users u ON u.id = ma.agent_id
      WHERE ma.manager_id = $1
        AND ma.agent_id = $2
        AND u.role = 'agent'
        AND u.is_active = TRUE
      `,
      [req.user.id, agentId]
    );

    if (!access.rows.length) {
      return res.status(404).json({
        message: "Agent not found.",
      });
    }

    const sessions = await pool.query(
      `
      SELECT
        ts.id,
        ts.status,
        ts.started_at,
        ts.completed_at,
        s.title AS scenario_title
      FROM training_sessions ts
      JOIN training_scenarios s
        ON s.id = ts.scenario_id
      WHERE ts.user_id = $1
      ORDER BY ts.started_at DESC, ts.id DESC
      LIMIT 100
      `,
      [agentId]
    );

    const user = access.rows[0];

    return res.json({
      agent: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        score: null,
        skills: null,
      },
      sessions: sessions.rows,
    });
  } catch (error) {
    console.error("Manager report error:", error);
    return res.status(500).json({
      message: "Unable to retrieve agent report.",
    });
  }
}

module.exports = {
  getOverview,
  getAgents,
  getAgentReport,
};
