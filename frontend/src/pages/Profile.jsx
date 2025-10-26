import React, { useEffect, useState } from "react";
import { get } from "../api";

export default function Profile() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user.role) {
      setMessage("Guest users cannot view history. Please log in.");
      return;
    }

    (async () => {
      const token = localStorage.getItem("token");
      const res = await get("/users/history", token);
      if (res.history) setHistory(res.history);
      else setMessage(res.message || "No history found.");
    })();
  }, []);

  const title =
    user.role === "ADMIN" ? "All Users' Contest History" : "My Contest History";

  return (
    <section>
      <h2>{title}</h2>
      <div className="muted">
        {message ||
          (user.role === "ADMIN"
            ? "View every user's best contest performance"
            : "Your recent contests and best submissions")}
      </div>

      <div className="grid">
        {history.map((h) => (
          <div key={h._id} className="card small">
            {user.role === "ADMIN" && (
              <div className="muted">
                👤 {h.user?.name || "Unknown"} ({h.user?.role || "N/A"})
              </div>
            )}
            <h4>{h.contest.name}</h4>
            <div className="muted">Score: {h.score}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
