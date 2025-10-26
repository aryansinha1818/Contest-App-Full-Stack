const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  name: String,
  description: String,
  type: { type: String, enum: ["NORMAL", "VIP"], default: "NORMAL" },
  startTime: Date,
  endTime: Date,
  prize: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
});

module.exports = mongoose.model("Contest", contestSchema);
