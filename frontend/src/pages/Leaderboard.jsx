import React, { useEffect, useState } from "react";
import { get, del } from "../api";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);

    const fetchLeaderboard = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await get("/leaderboard", token);

        if (Array.isArray(res)) {
          setLeaderboard(res);
        } else if (Array.isArray(res.leaderboard)) {
          setLeaderboard(res.leaderboard);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setLeaderboard([]);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this result?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await del(`/leaderboard/${id}`, token);
      setLeaderboard((prev) => prev.filter((entry) => entry._id !== id));
      alert("Result deleted successfully!");
    } catch (err) {
      console.error("Error deleting result:", err);
      alert("Failed to delete result.");
    }
  };

  return (
    <section className="container">
      <h2>Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Contest</th>
              <th>Score</th>
              {user?.role === "ADMIN" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry._id}>
                <td>{index + 1}</td>
                <td>{entry.user?.name || "Unknown"}</td>
                <td>{entry.contest?.name || "Unknown Contest"}</td>
                <td>{entry.score}</td>

                {user?.role === "ADMIN" && (
                  <td>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="btn small danger"
                    >
                      🗑 Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
