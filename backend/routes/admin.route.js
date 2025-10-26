const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const Contest = require("../models/contest.model");
const Question = require("../models/question.model");
const Submission = require("../models/submission.model");
const User = require("../models/user.model");

const router = express.Router();

router.get(
  "/stats",
  authenticate,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      const totalContests = await Contest.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalSubmissions = await Submission.countDocuments();

      const top = await Submission.find()
        .populate("user", "name role")
        .populate("contest", "name")
        .sort({ score: -1 })
        .limit(3);

      res.json({
        message: "Admin stats fetched successfully",
        stats: {
          totalContests,
          totalUsers,
          totalSubmissions,
          topScorers: top.map((t) => ({
            user: t.user?.name,
            role: t.user?.role,
            contest: t.contest?.name,
            score: t.score,
          })),
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/contest/:id",
  authenticate,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      await Contest.findByIdAndDelete(req.params.id);
      res.json({ message: "Contest deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/question/:id",
  authenticate,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      await Question.findByIdAndDelete(req.params.id);
      res.json({ message: "Question deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/user/:id",
  authenticate,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      await Submission.deleteMany({ user: req.params.id });
      res.json({
        message: "User and related submissions deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/submission/:id",
  authenticate,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      await Submission.findByIdAndDelete(req.params.id);
      res.json({ message: "Submission deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/question/:id",
  authenticate,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { text, type, options, correctAnswers } = req.body;

      const updated = await Question.findByIdAndUpdate(
        id,
        { text, type, options, correctAnswers },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json({
        message: "Question updated successfully",
        question: updated,
      });
    } catch (err) {
      console.error("Error updating question:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
