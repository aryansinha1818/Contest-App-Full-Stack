const express = require("express");
const router = express.Router();
const {
  getLeaderboard,
  getTopScorer,
  getUserHistory,
  deleteResult, // 🟢 Add new controller
} = require("../controllers/leaderboard.controller");

const {
  authenticate,
  authorizeAdmin,
} = require("../middlewares/auth.middleware");

// ✅ Existing routes
router.get("/", authenticate, getLeaderboard);
router.get("/:contestId/top", authenticate, getTopScorer);
router.get("/user/history", authenticate, getUserHistory);

// 🟢 NEW: Delete leaderboard result (Admin only)
router.delete("/:id", authenticate, authorizeAdmin, deleteResult);

module.exports = router;
