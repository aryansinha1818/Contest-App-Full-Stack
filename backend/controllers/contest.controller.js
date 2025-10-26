const mongoose = require("mongoose");
const Contest = require("../models/contest.model");
const Question = require("../models/question.model");
const Submission = require("../models/submission.model");
const { calculateScore } = require("../services/scoring.service");
const User = require("../models/user.model");

// ✅ Create contest (Admin only)
const createContest = async (req, res) => {
  try {
    const { name, description, type, startTime, endTime, prize } = req.body;

    const contest = new Contest({
      name,
      description,
      type,
      startTime,
      endTime,
      prize,
    });

    await contest.save();
    res.status(201).json({
      message: "Contest created successfully",
      contest,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Add question
const addQuestion = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { text, type, options, correctAnswers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return res.status(400).json({ message: "Invalid contest ID format" });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const question = new Question({
      text,
      type,
      options,
      correctAnswers,
      contest: new mongoose.Types.ObjectId(contestId),
    });

    await question.save();
    contest.questions.push(question._id);
    await contest.save();

    res.status(201).json({
      message: "Question added successfully",
      question,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// ✅ Get contests (filtered by role, supports guests)
const getContests = async (req, res) => {
  try {
    // 🟢 Handle logged-in or guest users
    const userId = req.user ? req.user.id : null;
    let user = null;

    if (userId) {
      user = await User.findById(userId);
    }

    let query = {};

    // 🟢 Logged-in users get contests based on role
    if (user && user.role === "NORMAL") {
      query = { type: "NORMAL" };
    } else if (user && user.role === "VIP") {
      query = { type: { $in: ["NORMAL", "VIP"] } };
    }
    // 🟢 Guests (no login) can see all public contests
    else if (!user) {
      query = {}; // or add `{ isPublic: true }` if your model supports it
    }

    const contests = await Contest.find(query).lean();

    // 🟢 For guests, just send contests directly
    if (!user) {
      return res.status(200).json({ contests });
    }

    // 🟢 For logged-in users, include their contest statuses
    const submissions = await Submission.find({ user: userId });
    const contestStatuses = {};
    submissions.forEach((sub) => {
      contestStatuses[sub.contest.toString()] = sub.status;
    });

    const contestsWithStatus = contests.map((c) => ({
      ...c,
      status: contestStatuses[c._id.toString()] || "not-started",
    }));

    res.status(200).json({ contests: contestsWithStatus });
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Participate in a contest
const participateInContest = async (req, res) => {
  try {
    const { id: contestId } = req.params;
    const userId = req.user.id;

    const existing = await Submission.findOne({
      user: userId,
      contest: contestId,
    });
    if (existing) {
      return res.status(200).json({
        message: "Contest already in progress or completed",
        status: existing.status,
      });
    }

    const submission = new Submission({
      user: userId,
      contest: contestId,
      answers: {},
      status: "in-progress",
      startedAt: new Date(),
    });

    await submission.save();
    res.status(200).json({ message: "Contest joined", status: "in-progress" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Submit contest (calculate score)
// ✅ Submit contest (calculate score)
const submitContest = async (req, res) => {
  try {
    const { contestId, answers } = req.body;
    const userId = req.user.id;

    const contest = await Contest.findById(contestId).populate("questions");
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    let score = 0;

    contest.questions.forEach((q) => {
      const userAns = answers[q._id] || [];
      const correctAns = q.correctAnswers;

      if (q.type === "MULTI") {
        const correctSet = new Set(correctAns);
        const userSet = new Set(userAns);
        if (
          correctSet.size === userSet.size &&
          [...correctSet].every((a) => userSet.has(a))
        )
          score++;
      } else {
        if (userAns[0] === correctAns[0]) score++;
      }
    });

    const submission = await Submission.findOneAndUpdate(
      { user: userId, contest: contestId },
      { answers, score, status: "submitted", submittedAt: new Date() },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Contest submitted successfully",
      score,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Get questions for a contest
const getQuestionsByContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    const questions = await Question.find({ contest: contestId });
    res.status(200).json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Save progress and mark answered questions as locked
const saveContestProgress = async (req, res) => {
  try {
    const { contestId, answers } = req.body;
    const userId = req.user.id;

    if (!contestId) {
      return res.status(400).json({ message: "Contest ID is required" });
    }

    // Fetch or create a submission
    let submission = await Submission.findOne({
      user: userId,
      contest: contestId,
    });

    if (!submission) {
      submission = new Submission({
        user: userId,
        contest: contestId,
        answers: [],
        status: "in-progress",
        startedAt: new Date(),
      });
    }

    // 🔹 Merge new answers into old ones (lock once answered)
    const answerMap = new Map();

    // Add old answers (already locked)
    for (const a of submission.answers) {
      answerMap.set(a.question, a.selected);
    }

    // Add new answers (only if not already locked)
    for (const a of answers) {
      if (!answerMap.has(a.question)) {
        answerMap.set(a.question, a.selected);
      }
    }

    // Convert back to array
    submission.answers = Array.from(answerMap, ([question, selected]) => ({
      question,
      selected,
    }));

    submission.status = "in-progress";
    submission.lastSavedAt = new Date();
    await submission.save();

    res.status(200).json({
      message: "Progress saved successfully",
      status: submission.status,
      lockedQuestions: Array.from(answerMap.keys()), // send locked question IDs
    });
  } catch (error) {
    console.error("Error saving progress:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    await Question.findByIdAndDelete(questionId);
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createContest,
  addQuestion,
  getContests,
  participateInContest,
  submitContest,
  getQuestionsByContest,
  deleteQuestion,
  saveContestProgress,
};
