
const express = require("express");
const crypto = require("crypto");
const { sendManagerInvitationEmail } = require("../services/emailService");

const pool = require("../config/database");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// All admin endpoints require authentication
// and administrator authorization.
router.use(authenticateToken, requireAdmin);

router.get("/me", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         first_name,
         last_name,
         email,
         role,
         email_verified,
         created_at
       FROM users
       WHERE id = $1`,
      [req.admin.id]
    );

    if (result.rowCount !== 1) {
      return res.status(404).json({
        message: "Administrator not found.",
      });
    }

    const admin = result.rows[0];

    return res.status(200).json({
      user: {
        id: admin.id,
        firstName: admin.first_name,
        lastName: admin.last_name,
        email: admin.email,
        role: admin.role,
        emailVerified: admin.email_verified,
        createdAt: admin.created_at,
      },
    });
  } catch (error) {
    console.error("Admin profile error:", error);

    return res.status(500).json({
      message: "Unable to retrieve administrator profile.",
    });
  }
});

router.get("/overview", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS total_users,

         COUNT(*) FILTER (
           WHERE role = 'agent'
         )::int AS total_agents,

         COUNT(*) FILTER (
           WHERE role = 'manager'
         )::int AS total_managers,

         COUNT(*) FILTER (
           WHERE role = 'admin'
         )::int AS total_admins,

         COUNT(*) FILTER (
           WHERE is_active = TRUE
         )::int AS active_users,

         COUNT(*) FILTER (
           WHERE is_active = FALSE
         )::int AS suspended_users,

         COUNT(*) FILTER (
           WHERE email_verified = FALSE
         )::int AS unverified_users

       FROM users`
    );

    const stats = result.rows[0];

    return res.status(200).json({
      overview: {
        totalUsers: stats.total_users,
        totalAgents: stats.total_agents,
        totalManagers: stats.total_managers,
        totalAdmins: stats.total_admins,
        activeUsers: stats.active_users,
        suspendedUsers: stats.suspended_users,
        unverifiedUsers: stats.unverified_users,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);

    return res.status(500).json({
      message: "Unable to retrieve platform statistics.",
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const {
      search = "",
      role = "all",
      status = "all",
    } = req.query;

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Invalid pagination parameters.",
      });
    }

    const validRoles = [
      "all",
      "agent",
      "manager",
      "admin",
    ];

    const validStatuses = [
      "all",
      "active",
      "suspended",
      "unverified",
    ];

    if (
      typeof search !== "string" ||
      search.length > 100 ||
      !validRoles.includes(role) ||
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid user filters.",
      });
    }

    const conditions = [];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);

      conditions.push(`
        (
          first_name ILIKE $${values.length}
          OR last_name ILIKE $${values.length}
          OR email ILIKE $${values.length}
          OR CONCAT_WS(' ', first_name, last_name)
             ILIKE $${values.length}
        )
      `);
    }

    if (role !== "all") {
      values.push(role);

      conditions.push(
        `role = $${values.length}`
      );
    }

    if (status === "active") {
      conditions.push("is_active = TRUE");
    } else if (status === "suspended") {
      conditions.push("is_active = FALSE");
    } else if (status === "unverified") {
      conditions.push("email_verified = FALSE");
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // Count users matching the selected filters.
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM users
       ${whereClause}`,
      values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;

    const limitParameter = values.length + 1;
    const offsetParameter = values.length + 2;

    const usersResult = await pool.query(
      `SELECT
         id,
         first_name,
         last_name,
         email,
         role,
         email_verified,
         is_active,
         created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $${limitParameter}
       OFFSET $${offsetParameter}`,
      [...values, limit, offset]
    );

    const users = usersResult.rows.map((user) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      emailVerified: user.email_verified,
      isActive: user.is_active,
      createdAt: user.created_at,
    }));

    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);

    return res.status(500).json({
      message: "Unable to retrieve registered users.",
    });
  }
});

router.patch("/users/:id/status", async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body || {};

    // Validate the requested account status.
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false.",
      });
    }

    // Prevent the administrator from changing
    // their own account status.
    if (String(userId) === String(req.admin.id)) {
      return res.status(403).json({
        message:
          "You cannot suspend or reactivate your own administrator account.",
      });
    }

    // Only agents and managers can be modified.
    // Admin accounts are protected.
    const result = await pool.query(
      `UPDATE users
       SET is_active = $1
       WHERE id = $2
         AND role IN ('agent', 'manager')
       RETURNING
         id,
         first_name,
         last_name,
         email,
         role,
         is_active,
         email_verified,
         created_at`,
      [isActive, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "Eligible user not found. Administrator accounts cannot be modified.",
      });
    }

    const account = result.rows[0];

    return res.status(200).json({
      message: isActive
        ? "User account reactivated successfully."
        : "User account suspended successfully.",
      user: {
        id: account.id,
        firstName: account.first_name,
        lastName: account.last_name,
        email: account.email,
        role: account.role,
        isActive: account.is_active,
        emailVerified: account.email_verified,
        createdAt: account.created_at,
      },
    });
  } catch (error) {
    console.error("Admin account status error:", error);

    if (error.code === "22P02") {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    return res.status(500).json({
      message: "Unable to update user account status.",
    });
  }
});

/* ==========================================
   CREATE SALES MANAGER ACCOUNT
   POST /api/admin/managers
   ========================================== */
router.post("/managers", async (req, res) => {
  const { firstName, lastName, email } = req.body || {};

  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    !firstName.trim() ||
    !lastName.trim() ||
    firstName.trim().length > 100 ||
    lastName.trim().length > 100
  ) {
    return res.status(400).json({ message: "Enter a valid first name, last name, and email." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  // Configure this to the public origin of the React application,
 
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    console.error("FRONTEND_URL is not configured.");
    return res.status(500).json({ message: "Manager invitations are not configured." });
  }

  let origin;
  try {
    const parsed = new URL(frontendUrl);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
      throw new Error("Invalid URL");
    }
    origin = parsed.origin;
  } catch {
    return res.status(500).json({ message: "Manager invitations are not configured correctly." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invitationUrl = `${origin}/manager/activate?token=${encodeURIComponent(token)}`;

  let client;
  let transactionOpen = false;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    transactionOpen = true;

    const existing = await client.query(
      "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1",
      [normalizedEmail]
    );
    if (existing.rowCount) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return res.status(409).json({ message: "An account with this email already exists. Promote an existing agent instead." });
    }

    const created = await client.query(
      `INSERT INTO users
        (first_name, last_name, email, password_hash, role, is_active, email_verified)
       VALUES ($1, $2, $3, NULL, 'manager', FALSE, FALSE)
       RETURNING id, first_name, last_name, email, role, is_active, email_verified, created_at`,
      [firstName.trim(), lastName.trim(), normalizedEmail]
    );
    const manager = created.rows[0];

    await client.query(
      `INSERT INTO manager_invitations (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [manager.id, tokenHash]
    );

    // If email delivery fails, roll back account and invitation creation.
    await sendManagerInvitationEmail({
      email: manager.email,
      firstName: manager.first_name,
      invitationUrl,
      expiresInHours: 24,
    });

    await client.query("COMMIT");
    transactionOpen = false;

    return res.status(201).json({
      message: "Manager invitation sent successfully.",
      manager: {
        id: manager.id,
        firstName: manager.first_name,
        lastName: manager.last_name,
        email: manager.email,
        role: manager.role,
        isActive: manager.is_active,
        emailVerified: manager.email_verified,
        createdAt: manager.created_at,
      },
    });
  } catch (error) {
    if (client && transactionOpen) {
      await client.query("ROLLBACK").catch(() => {});
    }
    console.error("Create manager error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    return res.status(500).json({ message: "Unable to create the manager or send the invitation." });
  } finally {
    if (client) client.release();
  }
});

/* ==========================================
   PROMOTE AN EXISTING AGENT TO MANAGER
   PATCH /api/admin/users/:id/promote
   ========================================== */
router.patch("/users/:id/promote", async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = 'manager', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND role = 'agent'
         AND is_active = TRUE
         AND email_verified = TRUE
       RETURNING id, first_name, last_name, email, role, is_active, email_verified, created_at`,
      [userId]
    );

    if (!result.rowCount) {
      return res.status(409).json({
        message: "Only existing, active, email-verified agents can be promoted.",
      });
    }

    const manager = result.rows[0];
    return res.status(200).json({
      message: "Sales Agent promoted to Sales Manager successfully.",
      manager: {
        id: manager.id,
        firstName: manager.first_name,
        lastName: manager.last_name,
        email: manager.email,
        role: manager.role,
        isActive: manager.is_active,
        emailVerified: manager.email_verified,
        createdAt: manager.created_at,
      },
    });
  } catch (error) {
    console.error("Promote agent error:", error);
    return res.status(500).json({ message: "Unable to promote this agent." });
  }
});

module.exports = router;
