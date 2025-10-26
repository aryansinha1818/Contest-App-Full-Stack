import React, { useState, useEffect } from "react";
import { post, get, del } from "../api";
import { useParams, Link } from "react-router-dom";

export default function AddQuestion() {
  const { contestId } = useParams();
  const [form, setForm] = useState({
    contestId: contestId || "",
    text: "",
    type: "SINGLE",
    options: "",
    correctAnswers: "",
  });
  const [msg, setMsg] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loadQuestions = async () => {
    if (!contestId) return;
    const res = await get(`/contests/${contestId}/questions`, token);
    if (res.questions) setQuestions(res.questions);
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      text: form.text,
      type: form.type,
      options: form.options.split(",").map((x) => x.trim()),
      correctAnswers: form.correctAnswers.split(",").map((x) => x.trim()),
    };

    if (editingId) {
      const res = await fetch(
        `http://localhost:5050/api/admin/question/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.message || data._id) {
        setMsg("✏️ Question updated successfully!");
        setEditingId(null);
        setForm({ ...form, text: "", options: "", correctAnswers: "" });
        loadQuestions();
      } else {
        setMsg(data.error || "Failed to update question");
      }
    } else {
      const res = await post(
        `/contests/${form.contestId}/question`,
        payload,
        token
      );
      if (res.question) {
        setMsg("✅ Question added successfully!");
        setForm({ ...form, text: "", options: "", correctAnswers: "" });
        loadQuestions();
      } else {
        setMsg(res.message || res.error || "Failed to add question");
      }
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    const res = await del(
      `/contests/${contestId}/question/${questionId}`,
      token
    );
    if (res.message) {
      setMsg("🗑️ Question deleted successfully!");
      loadQuestions();
    } else {
      setMsg(res.error || "Failed to delete question");
    }
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    setForm({
      contestId,
      text: q.text,
      type: q.type,
      options: q.options.join(", "),
      correctAnswers: q.correctAnswers.join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (contestId) loadQuestions();
  }, [contestId]);

  return (
    <section className="auth-card">
      <div className="flex-between">
        <h2>{editingId ? "Edit Question" : "Add Question"}</h2>
        <Link to="/contests" className="btn ghost small">
          ← Back to Contests
        </Link>
      </div>

      <form onSubmit={submit}>
        <label>Contest ID</label>
        <input
          type="text"
          name="contestId"
          value={form.contestId}
          onChange={handleChange}
          readOnly={!!contestId}
          required
          className={contestId ? "readonly-input" : ""}
        />

        <label>Question Text</label>
        <textarea
          name="text"
          value={form.text}
          onChange={handleChange}
          rows="4"
          required
          className="question-textbox"
        />

        <label>Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="SINGLE">Single</option>
          <option value="MULTI">Multi</option>
          <option value="TRUE_FALSE">True/False</option>
        </select>

        <label>Options (comma separated)</label>
        <input
          name="options"
          value={form.options}
          onChange={handleChange}
          required
        />

        <label>Correct Answers (comma separated)</label>
        <input
          name="correctAnswers"
          value={form.correctAnswers}
          onChange={handleChange}
          required
        />

        <button className="btn" type="submit">
          {editingId ? "Update Question" : "Add Question"}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn ghost small"
            onClick={() => {
              setEditingId(null);
              setForm({ ...form, text: "", options: "", correctAnswers: "" });
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        )}
      </form>

      {msg && (
        <div className="muted" style={{ marginTop: 10 }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h3>Existing Questions</h3>
        {questions.length > 0 ? (
          <div className="question-list">
            {questions.map((q, i) => (
              <div key={q._id} className="question-item">
                <div className="question-text">
                  <strong>Q{i + 1}:</strong> {q.text}
                </div>
                <div className="muted">
                  Type: {q.type} | Options: {q.options.join(", ")} | Correct:{" "}
                  {q.correctAnswers.join(", ")}
                </div>
                <button
                  className="btn small"
                  style={{
                    backgroundColor: "#0ea5a4",
                    color: "white",
                    marginRight: "8px",
                  }}
                  onClick={() => handleEdit(q)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(q._id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No questions added yet.</p>
        )}
      </div>
    </section>
  );
}
