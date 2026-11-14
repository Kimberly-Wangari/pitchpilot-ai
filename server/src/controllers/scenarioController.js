const pool = require("../config/database");

// GET /api/scenarios
async function getScenarios(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        id,
        title,
        description,
        category,
        difficulty,
        customer_persona,
        situation,
        objective,
        target_competencies
       FROM training_scenarios
       WHERE is_active = TRUE
       ORDER BY id ASC`
    );

    return res.status(200).json({
      count: result.rows.length,
      scenarios: result.rows,
    });
  } catch (error) {
    console.error("Get scenarios error:", error);

    return res.status(500).json({
      message: "Unable to retrieve training scenarios.",
    });
  }
}

// GET /api/scenarios/:id
async function getScenarioById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        title,
        description,
        category,
        difficulty,
        customer_persona,
        situation,
        objective,
        target_competencies
       FROM training_scenarios
       WHERE id = $1
       AND is_active = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Training scenario not found.",
      });
    }

    return res.status(200).json({
      scenario: result.rows[0],
    });
  } catch (error) {
    console.error("Get scenario error:", error);

    return res.status(500).json({
      message: "Unable to retrieve training scenario.",
    });
  }
}

module.exports = {
  getScenarios,
  getScenarioById,
};