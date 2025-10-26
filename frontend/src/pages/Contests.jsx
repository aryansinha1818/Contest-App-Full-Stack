import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../api";

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userData);

    const fetchContests = async () => {
      try {
        const res = await get("/contests", token);
        setContests(res.contests || []);
      } catch (err) {
        console.error("Error fetching contests:", err);
      }
    };
    fetchContests();
  }, []);

  const handleParticipate = async (contestId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to participate.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5050/api/contests/${contestId}/participate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.status === "in-progress") {
        navigate(`/contests/${contestId}/questions`);
      } else if (data.status === "submitted") {
        alert("You have already completed this contest!");
      } else {
        navigate(`/contests/${contestId}/questions`);
      }
    } catch (error) {
      console.error("Participation error:", error);
      alert("Failed to participate");
    }
  };

  return (
    <section className="container">
      <h2>Available Contests</h2>

      <div className="grid contest-grid">
        {contests.length > 0 ? (
          contests.map((c) => (
            <div key={c._id} className={`card contest-card ${c.type}`}>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <div className="contest-id">Contest ID: {c._id}</div>

              {!user ? (
                <p style={{ color: "#888", marginTop: "8px" }}>
                  Login to participate or manage contests.
                </p>
              ) : (
                <div className="contest-actions">
                  {user.role === "ADMIN" ? (
                    <>
                      <button
                        className="btn small"
                        onClick={() => navigate(`/add-question/${c._id}`)}
                      >
                        ➕ Add / Manage Questions
                      </button>
                      <button
                        className="btn small ghost"
                        style={{ marginLeft: "8px", color: "#ef4444" }}
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Delete this contest and all its questions?"
                            )
                          ) {
                            const token = localStorage.getItem("token");
                            const res = await fetch(
                              `http://localhost:5050/api/admin/contest/${c._id}`,
                              {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              }
                            );
                            const data = await res.json();
                            alert(
                              data.message || data.error || "Contest deleted"
                            );
                            window.location.reload();
                          }
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  ) : c.status === "in-progress" ? (
                    <button
                      className="btn small"
                      style={{ backgroundColor: "#eab308" }}
                      onClick={() => navigate(`/contests/${c._id}/questions`)}
                    >
                      Resume (In Progress)
                    </button>
                  ) : c.status === "submitted" ? (
                    <button className="btn small ghost" disabled>
                      Completed
                    </button>
                  ) : (
                    <button
                      className="btn small"
                      onClick={() => handleParticipate(c._id)}
                    >
                      Participate
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No contests available.</p>
        )}
      </div>
    </section>
  );
}
