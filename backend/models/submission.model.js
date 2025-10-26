const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
  answers: [{ question: String, selected: [String] }],
  score: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["in-progress", "submitted"],
    default: "in-progress",
  },
  startedAt: Date,
  lastSavedAt: Date,
  submittedAt: Date,
});

module.exports = mongoose.model("Submission", submissionSchema);
