
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1. Check that an authorization token exists.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify the JWT.
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.id) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    // 3. Retrieve the latest account information.
    const result = await pool.query(
      `SELECT
         id,
         email,
         role,
         is_active,
         email_verified
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [decoded.id]
    );

    // 4. Reject deleted or nonexistent accounts.
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Account not found. Please log in again.",
      });
    }

    const account = result.rows[0];

    // 5. Block suspended accounts.
    if (!account.is_active) {
      return res.status(403).json({
        message:
          "Your account has been suspended. Please contact the administrator.",
        code: "ACCOUNT_SUSPENDED",
      });
    }

    // 6. Block accounts that have not verified their email.
    if (!account.email_verified) {
      return res.status(403).json({
        message:
          "Your email address is not verified.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // 7. Use the current role from PostgreSQL,
    // rather than trusting a potentially outdated JWT role.
    req.user = {
      id: account.id,
      email: account.email,
      role: account.role,
    };

    // 8. Continue to the protected route.
    return next();
  } catch (error) {
    // JWT verification errors.
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token.",
      });
    }

    // Database or unexpected server errors.
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Unable to verify account access.",
    });
  }
}

module.exports = {
  authenticateToken,
};
