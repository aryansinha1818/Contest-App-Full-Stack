import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get, post } from "../api";

export default function ContestDetail() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const res = await get(`/contests?id=${id}`);

      const found =
        (res.contests || []).find((c) => c._id === id) || res.contest;
      setContest(found);
    })();
  }, [id]);

  const toggle = (qId, opt) => {
    setAnswers((prev) => {
      const sel = prev[qId] || [];
      const isMulti = true;
      if (isMulti) {
        const next = sel.includes(opt)
          ? sel.filter((x) => x !== opt)
          : [...sel, opt];
        return { ...prev, [qId]: next };
      }
    });
  };

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setMessage("Login required to submit");
    const payload = {
      contestId: id,
      answers: Object.keys(answers).map((q) => ({
        question: q,
        selected: answers[q],
      })),
    };
    const res = await post("/contests/submit", payload, token);
    if (res.score !== undefined) setMessage(`Score: ${res.score}`);
    else setMessage(res.message || "Submission failed");
  };

  if (!contest) return <div>Loading contest...</div>;

  return (
    <section>
      <div className="page-hed">
        <h2>{contest.name}</h2>
        <p className="muted">{contest.description}</p>
      </div>

      <div className="qa">
        {(contest.questions || []).map((q) => (
          <div key={q._id} className="q">
            <h4>{q.text}</h4>
            <div className="opts">
              {(q.options || []).map((opt) => (
                <label key={opt} className="opt">
                  <input
                    type="checkbox"
                    onChange={() => toggle(q._id, opt)}
                    checked={(answers[q._id] || []).includes(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn" onClick={submit}>
          Submit
        </button>
        {message && (
          <div className="muted" style={{ marginTop: 10 }}>
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
