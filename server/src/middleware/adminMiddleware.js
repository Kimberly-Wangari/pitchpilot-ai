
const pool = require("../config/database");

// Only this verified account can access admin features.
const ADMIN_EMAIL = "pitchpilot.admin@gmail.com";

/**
 * Protect administrative routes.
 *
 * IMPORTANT:
 * This middleware assumes that the request has already been authenticated
 *
 * Example:
 * router.get("/users", protect, requireAdmin, getUsers);
 */
async function requireAdmin(req, res, next) {
  try {
    // req.user must be populated by existing JWT middleware.
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Always check the current PostgreSQL account state.
    // Do not trust a role or email supplied by the frontend.
    const result = await pool.query(
      `SELECT
         id,
         email,
         role,
         is_active,
         email_verified
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rowCount !== 1) {
      return res.status(401).json({
        message: "Account not found.",
      });
    }

    const user = result.rows[0];

    const authorizedEmail =
      user.email?.trim().toLowerCase() === ADMIN_EMAIL;

    const authorizedRole = user.role === "admin";

    const accountActive = user.is_active === true;

    const emailVerified = user.email_verified === true;

    if (
      !authorizedEmail ||
      !authorizedRole ||
      !accountActive ||
      !emailVerified
    ) {
      return res.status(403).json({
        message:
          "Access denied. Administrator privileges required.",
      });
    }

    // Make verified administrator information available
    // to subsequent route handlers.
    req.admin = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    return res.status(500).json({
      message: "Unable to verify administrator access.",
    });
  }
}

module.exports = requireAdmin;
