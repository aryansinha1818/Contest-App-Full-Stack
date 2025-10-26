const calculateScore = (questions, answers) => {
  let score = 0;

  for (const ans of answers) {
    const q = questions.find((q) => q._id.toString() === ans.question);
    if (!q) continue;

    const correct = q.correctAnswers.map((a) => a.trim().toLowerCase());
    const selected = (ans.selected || []).map((a) => a.trim().toLowerCase());

    if (q.type === "SINGLE" || q.type === "TRUE_FALSE") {
      if (
        correct.length === selected.length &&
        correct.every((a) => selected.includes(a))
      ) {
        score += 1;
      }
    } else if (q.type === "MULTI") {
      let correctCount = 0;
      for (const choice of selected) {
        if (correct.includes(choice)) correctCount++;
      }

      const partialScore = correctCount / correct.length;
      score += partialScore;
    }
  }

  return Number(score.toFixed(2));
};

module.exports = { calculateScore };
