const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login } = require("../controllers/auth.controller");
const User = require("../models/user.model");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: "Too many login/register attempts. Please try again later.",
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// ✅ Add this route
router.get("/check-admin", async (req, res) => {
  try {
    const exists = await User.exists({ role: "ADMIN" });
    res.json({ exists: !!exists });
  } catch {
    res.status(500).json({ exists: true });
  }
});

module.exports = router;
