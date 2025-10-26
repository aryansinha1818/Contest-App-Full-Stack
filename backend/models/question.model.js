const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ["SINGLE", "MULTI", "TRUE_FALSE"],
    required: true,
  },
  options: [{ type: String, required: true }],
  correctAnswers: [{ type: String, required: true }],
});

module.exports = mongoose.model("Question", questionSchema);
