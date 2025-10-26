const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  getUserHistory,
  getAllUsers,
} = require("../controllers/user.controller");

const router = express.Router();

// ✅ Admin-only route to get all users
router.get("/", authenticate, roleMiddleware(["ADMIN"]), getAllUsers);

// ✅ Logged-in users can view their own history
router.get("/history", authenticate, getUserHistory);

module.exports = router;
