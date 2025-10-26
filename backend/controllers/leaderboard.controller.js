const mongoose = require("mongoose");
const Submission = require("../models/submission.model");

const getLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.query;
    const filter = contestId ? { contest: contestId } : {};

    const submissions = await Submission.find(filter)
      .populate("user", "name role")
      .populate("contest", "name type prize")
      .sort({ score: -1, submittedAt: 1 });

    const leaderboardMap = new Map();
    submissions.forEach((sub) => {
      const key = `${sub.user._id}-${sub.contest._id}`;
      const existing = leaderboardMap.get(key);
      if (!existing || sub.score > existing.score) {
        leaderboardMap.set(key, sub);
      }
    });

    const leaderboard = Array.from(leaderboardMap.values());

    res.status(200).json({
      message: "Leaderboard fetched successfully",
      leaderboard,
    });
  } catch (error) {
    console.error("❌ Error in getLeaderboard:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getTopScorer = async (req, res) => {
  try {
    const { contestId } = req.params;

    const top = await Submission.find({ contest: contestId })
      .populate("user", "name role")
      .populate("contest", "name prize type")
      .sort({ score: -1, submittedAt: 1 })
      .limit(1);

    if (!top.length)
      return res
        .status(404)
        .json({ message: "No submissions for this contest" });

    res.status(200).json({
      message: "Top scorer fetched successfully",
      topScorer: top[0],
    });
  } catch (error) {
    console.error("❌ Error in getTopScorer:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const history = await Submission.find({ user: userObjectId })
      .populate("contest", "name type prize startTime endTime")
      .sort({ submittedAt: -1 });

    if (!history.length)
      return res.status(404).json({ message: "No contest history found" });

    const uniqueMap = new Map();
    history.forEach((h) => {
      const contestId = h.contest._id.toString();
      if (
        !uniqueMap.has(contestId) ||
        h.score > uniqueMap.get(contestId).score
      ) {
        uniqueMap.set(contestId, h);
      }
    });

    const uniqueHistory = Array.from(uniqueMap.values());

    res.status(200).json({
      message: "User contest history fetched successfully",
      history: uniqueHistory,
    });
  } catch (error) {
    console.error("❌ Error in getUserHistory:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Submission.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.status(200).json({ message: "Result deleted successfully" });
  } catch (err) {
    console.error("Error deleting result:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getLeaderboard,
  getTopScorer,
  getUserHistory,
  deleteResult,
};
