
const express = require("express");
const pool = require("../config/database");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication.
router.use(authenticateToken);

/* ==========================================
   SUBMIT MANAGER ACCESS REQUEST
   POST /api/manager-access/requests
   ========================================== */

router.post("/requests", async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body || {};

    // Only agents may request manager access.
    if (req.user.role !== "agent") {
      return res.status(403).json({
        message:
          "Only agent accounts can request manager access.",
      });
    }

    // Validate the reason.
    if (
      typeof reason !== "string" ||
      reason.trim().length < 20 ||
      reason.trim().length > 1000
    ) {
      return res.status(400).json({
        message:
          "Please provide a reason between 20 and 1000 characters.",
      });
    }

    // Check for an existing pending request.
    const existingRequest = await pool.query(
      `SELECT id
       FROM manager_access_requests
       WHERE user_id = $1
         AND status = 'pending'
       LIMIT 1`,
      [userId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(409).json({
        message:
          "You already have a pending manager access request.",
      });
    }

    // Create a new request.
    const result = await pool.query(
      `INSERT INTO manager_access_requests (
         user_id,
         reason,
         status
       )
       VALUES ($1, $2, 'pending')
       RETURNING
         id,
         user_id,
         reason,
         status,
         created_at`,
      [userId, reason.trim()]
    );

    const request = result.rows[0];

    return res.status(201).json({
      message:
        "Your manager access request has been submitted successfully.",
      request: {
        id: request.id,
        userId: request.user_id,
        reason: request.reason,
        status: request.status,
        createdAt: request.created_at,
      },
    });
  } catch (error) {
    // The unique partial index prevents two
    // simultaneous pending requests.
    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "You already have a pending manager access request.",
      });
    }

    console.error(
      "Manager access request error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to submit manager access request.",
    });
  }
});

/* ==========================================
   VIEW MY MANAGER ACCESS REQUESTS
   GET /api/manager-access/requests/me
   ========================================== */

router.get("/requests/me", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         reason,
         status,
         review_note,
         created_at,
         reviewed_at
       FROM manager_access_requests
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      requests: result.rows.map((request) => ({
        id: request.id,
        reason: request.reason,
        status: request.status,
        reviewNote: request.review_note,
        createdAt: request.created_at,
        reviewedAt: request.reviewed_at,
      })),
    });
  } catch (error) {
    console.error(
      "Fetch manager requests error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve manager access requests.",
    });
  }
});

module.exports = router;
