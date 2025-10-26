import React, { useEffect, useState } from "react";
import { get } from "../api";
import "../History.css";

export default function History() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);

    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await get("/users/history", token);
        setData(res);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchHistory();
  }, []);

  if (!data) {
    return (
      <section className="history-container">
        <h2>Loading history...</h2>
      </section>
    );
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <section className="history-container">
      <h2 className="history-title">
        {isAdmin ? "All Users' Contest History" : "My Contest History"}
      </h2>

      {isAdmin ? (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Contest</th>
                <th>Type</th>
                <th>Score</th>
                <th>Prize</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.allHistories?.length > 0 ? (
                data.allHistories.map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.user?.name}</td>
                    <td>
                      <span
                        className={`role-badge ${
                          entry.user?.role === "ADMIN"
                            ? "role-admin"
                            : entry.user?.role === "VIP"
                            ? "role-vip"
                            : "role-normal"
                        }`}
                      >
                        {entry.user?.role}
                      </span>
                    </td>
                    <td>{entry.contest?.name}</td>
                    <td>{entry.contest?.type}</td>
                    <td>{entry.score}</td>
                    <td>{entry.contest?.prize || "-"}</td>
                    <td
                      className={`status-badge ${
                        entry.status === "submitted"
                          ? "status-submitted"
                          : entry.status === "in-progress"
                          ? "status-inprogress"
                          : "status-pending"
                      }`}
                    >
                      {entry.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {data.inProgress?.length > 0 && (
            <>
              <h3 className="section-subtitle">In-Progress Contests</h3>
              <div className="table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Contest</th>
                      <th>Type</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inProgress.map((entry, i) => (
                      <tr key={i}>
                        <td>{entry.contest?.name}</td>
                        <td>{entry.contest?.type}</td>
                        <td>{entry.score}</td>
                        <td className="status-badge status-inprogress">
                          {entry.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h3 className="section-subtitle">Completed Contests</h3>
          {data.completed?.length > 0 ? (
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Contest</th>
                    <th>Type</th>
                    <th>Score</th>
                    <th>Prize</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.completed.map((entry, i) => (
                    <tr key={i}>
                      <td>{entry.contest?.name}</td>
                      <td>{entry.contest?.type}</td>
                      <td>{entry.score}</td>
                      <td>{entry.contest?.prize || "-"}</td>
                      <td className="status-badge status-submitted">
                        {entry.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No completed contests found.</p>
          )}
        </>
      )}
    </section>
  );
}
