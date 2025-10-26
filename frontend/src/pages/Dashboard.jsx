import React, { useEffect, useState } from "react";
import { get } from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const loadStats = async () => {
    const res = await get("/admin/stats", token);
    if (res.stats) setStats(res.stats);
    else setMessage(res.message || res.error || "Unable to load stats.");
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    const res = await fetch(`http://localhost:5050/api/admin/${type}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    alert(data.message || data.error || "Action complete");
    loadStats();
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (message) return <div className="muted">{message}</div>;
  if (!stats) return <div>Loading...</div>;

  return (
    <section>
      <h2>Admin Dashboard</h2>
      <div className="grid">
        <div className="card small">
          <h3>{stats.totalContests}</h3>
          <div className="muted">Total Contests</div>
        </div>
        <div className="card small">
          <h3>{stats.totalUsers}</h3>
          <div className="muted">Registered Users</div>
        </div>
        <div className="card small">
          <h3>{stats.totalSubmissions}</h3>
          <div className="muted">Submissions</div>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <h3>🏆 Top Scorers</h3>
        {stats.topScorers?.length ? (
          <div className="table">
            <div className="tr head">
              <div>#</div>
              <div>User</div>
              <div>Contest</div>
              <div>Score</div>
              <div>Actions</div>
            </div>
            {stats.topScorers.map((s, i) => (
              <div className="tr" key={i}>
                <div>{i + 1}</div>
                <div>
                  {s.user} <span className="muted">({s.role})</span>
                </div>
                <div>{s.contest}</div>
                <div>{s.score}</div>
                <div>
                  <button
                    className="btn ghost"
                    onClick={() => handleDelete("submission", s._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">No submissions yet</div>
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>⚙️ Quick Admin Actions</h3>
        <div className="muted">Enter ID to delete:</div>
        <div style={{ marginTop: "10px" }}>
          <DeleteBox type="contest" token={token} />
          <DeleteBox type="question" token={token} />
          <DeleteBox type="user" token={token} />
        </div>
      </div>
    </section>
  );
}

function DeleteBox({ type, token }) {
  const [id, setId] = useState("");

  const handleDelete = async () => {
    if (!id.trim()) return alert("Enter a valid ID first.");
    if (!window.confirm(`Delete ${type} ${id}?`)) return;

    const res = await fetch(`http://localhost:5050/api/admin/${type}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    alert(data.message || data.error || "Action complete");
    setId("");
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <input
        value={id}
        placeholder={`${type} ID`}
        onChange={(e) => setId(e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
          marginRight: "8px",
        }}
      />
      <button className="btn ghost" onClick={handleDelete}>
        Delete {type}
      </button>
    </div>
  );
}
