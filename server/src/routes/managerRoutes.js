
const express = require("express");
const pool = require("../config/database");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  getOverview,
  getAgents,
  getAgentReport,
} = require("../controllers/managerController");

const router = express.Router();

async function requireManager(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT role, is_active
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(403).json({
        message: "Account access denied.",
      });
    }

    if (user.role !== "manager") {
      return res.status(403).json({
        message: "Manager access required.",
      });
    }

    next();
  } catch (error) {
    console.error("Manager authorization error:", error);
    res.status(500).json({
      message: "Unable to verify permissions.",
    });
  }
}

router.use(authenticateToken);
router.use(requireManager);

router.get("/overview", getOverview);
router.get("/agents", getAgents);
router.get("/agents/:id", getAgentReport);

module.exports = router;
