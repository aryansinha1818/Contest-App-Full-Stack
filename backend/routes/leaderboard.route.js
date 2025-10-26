const express = require("express");
const router = express.Router();
const {
  getLeaderboard,
  getTopScorer,
  getUserHistory,
  deleteResult,
} = require("../controllers/leaderboard.controller");

const {
  authenticate,
  authorizeAdmin,
} = require("../middlewares/auth.middleware");

router.get("/", authenticate, getLeaderboard);
router.get("/:contestId/top", authenticate, getTopScorer);
router.get("/user/history", authenticate, getUserHistory);

router.delete("/:id", authenticate, authorizeAdmin, deleteResult);

module.exports = router;
