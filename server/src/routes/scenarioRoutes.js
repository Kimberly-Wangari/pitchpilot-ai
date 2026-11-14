const express = require("express");

const {
  getScenarios,
  getScenarioById,
} = require("../controllers/scenarioController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getScenarios);

router.get("/:id", authenticateToken, getScenarioById);

module.exports = router;