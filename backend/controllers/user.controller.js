const Submission = require("../models/submission.model");
const Contest = require("../models/contest.model");
const User = require("../models/user.model");

// ✅ Fetch all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fetch user contest history
// - Admin: can see all users' histories
// - Normal/VIP user: can see only their own
const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "ADMIN") {
      // 🧩 Admin: fetch all users' submissions
      const allHistories = await Submission.find()
        .populate("contest", "name type prize startTime endTime")
        .populate("user", "name email role")
        .sort({ submittedAt: -1 });

      return res.status(200).json({
        message: "All users' histories fetched successfully",
        allHistories,
      });
    }

    // 🧩 VIP / NORMAL: fetch only their own submissions
    const userHistory = await Submission.find({ user: userId })
      .populate("contest", "name type prize startTime endTime")
      .sort({ submittedAt: -1 });

    const completed = [];
    const inProgress = [];

    userHistory.forEach((submission) => {
      if (submission.status === "submitted") completed.push(submission);
      else if (submission.status === "in-progress") inProgress.push(submission);
    });

    res.status(200).json({
      message: "User contest history fetched successfully",
      userId,
      completed,
      inProgress,
    });
  } catch (error) {
    console.error("Error in getUserHistory:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserHistory,
};
