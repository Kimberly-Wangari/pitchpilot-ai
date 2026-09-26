const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { register,
    login,
    getCurrentUser,
 } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;