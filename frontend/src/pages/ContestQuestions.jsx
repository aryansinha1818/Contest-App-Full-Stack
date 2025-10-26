import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, post } from "../api";

export default function ContestQuestions() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState(new Set());
  const [fullyLocked, setFullyLocked] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await get(`/contests/${contestId}/questions`, token);

        const progressRes = await get(`/users/history`, token);

        const userProgress = progressRes.inProgress?.find(
          (h) => h.contest._id === contestId
        );

        const savedAnswers = {};
        const locked = new Set();

        if (userProgress) {
          (userProgress.answers || []).forEach((a) => {
            savedAnswers[a.question] = a.selected;
            locked.add(a.question);
          });
        }

        setQuestions(data.questions || []);
        setAnswers(savedAnswers);
        setLockedQuestions(locked);
        setStatus(userProgress ? "in-progress" : "not-started");
      } catch (err) {
        console.error("Error loading contest:", err);
      }
    };

    fetchQuestions();
  }, [contestId]);

  const handleOptionChange = (qid, option, type) => {
    if (fullyLocked || lockedQuestions.has(qid)) return;

    setAnswers((prev) => {
      if (type === "MULTI") {
        const prevOptions = prev[qid] || [];
        return prevOptions.includes(option)
          ? { ...prev, [qid]: prevOptions.filter((o) => o !== option) }
          : { ...prev, [qid]: [...prevOptions, option] };
      } else {
        return { ...prev, [qid]: [option] };
      }
    });
  };

  const handleExit = async () => {
    const confirmExit = window.confirm(
      "Are you sure you want to exit? Your progress will be saved."
    );
    if (!confirmExit) return;

    try {
      const res = await post(
        "/contests/save-progress",
        {
          contestId,
          answers: Object.entries(answers).map(([question, selected]) => ({
            question,
            selected,
          })),
        },
        token
      );

      if (res.lockedQuestions) {
        setLockedQuestions(new Set(res.lockedQuestions));
      }

      alert("Progress saved successfully!");
      navigate("/contests");
    } catch (err) {
      console.error(err);
      alert("Failed to save progress.");
    }
  };

  const handleSubmit = async () => {
    if (fullyLocked) return;
    try {
      const res = await post("/contests/submit", { contestId, answers }, token);
      alert(`Contest submitted successfully! Score: ${res.score}`);
      setFullyLocked(true);
      navigate("/history");
    } catch (err) {
      console.error(err);
      alert("Error submitting contest.");
    }
  };

  const isQuestionLocked = (qid) => {
    return fullyLocked || lockedQuestions.has(qid);
  };

  return (
    <section className="container">
      <h2>
        Contest Questions{" "}
        {status === "in-progress" && (
          <span style={{ fontSize: "0.9rem", color: "#0ea5a4" }}>
            (Resumed - some answers locked)
          </span>
        )}
      </h2>

      {questions.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        <div className="qa">
          {questions.map((q, i) => {
            const questionLocked = isQuestionLocked(q._id);
            return (
              <div key={q._id} className="q">
                <p>
                  <strong>Q{i + 1}:</strong> {q.text}
                </p>

                <div className="opts">
                  {q.options.map((opt, j) => (
                    <label
                      key={j}
                      className={`opt ${questionLocked ? "opt-disabled" : ""}`}
                    >
                      <input
                        type={q.type === "MULTI" ? "checkbox" : "radio"}
                        name={`q${q._id}`}
                        value={opt}
                        checked={
                          q.type === "MULTI"
                            ? answers[q._id]?.includes(opt)
                            : answers[q._id]?.[0] === opt
                        }
                        disabled={questionLocked}
                        onChange={() => handleOptionChange(q._id, opt, q.type)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>

                {questionLocked && status === "in-progress" && (
                  <small className="muted">
                    (Saved before exit — cannot modify)
                  </small>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            <button
              className="btn small"
              onClick={handleSubmit}
              disabled={fullyLocked}
            >
              Submit Contest
            </button>
            <button
              className="btn ghost small"
              onClick={handleExit}
              disabled={fullyLocked}
            >
              Exit Contest
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
