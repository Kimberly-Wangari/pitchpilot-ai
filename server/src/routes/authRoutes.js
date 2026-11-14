const express = require("express");

const { authenticateToken } = require("../middleware/authMiddleware");

const {
  register,
  login,
  verifyOtp,
  resendOtp,
  getCurrentUser,
  updateProfile,
  requestPasswordReset,
  verifyPasswordReset,
  completePasswordReset,
  validateManagerInvitation,
  activateManagerAccount,
} = require("../controllers/authController");

const router = express.Router();

// Public registration and authentication
router.post("/register", register);
router.post("/login", login);

// Email verification and login OTP
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Password reset
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset", verifyPasswordReset);
router.post("/reset-password", completePasswordReset);

// Manager invitation activation
router.get("/manager-invitation", validateManagerInvitation);
router.post("/activate-manager", activateManagerAccount);

// Authenticated user profile
router.get("/me", authenticateToken, getCurrentUser);
router.patch("/profile", authenticateToken, updateProfile);

module.exports = router;
