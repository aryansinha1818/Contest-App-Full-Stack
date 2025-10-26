import React, { useEffect, useState } from "react";
import { get } from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUsers = async () => {
      try {
        const data = await get("/users", token);
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.users) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  if (error) {
    return (
      <section className="container">
        <h2>Registered Users</h2>
        <div className="err">{error}</div>
      </section>
    );
  }

  return (
    <section className="container">
      <h2>All Registered Users</h2>
      <p className="muted">List of all users who have signed up</p>

      {users.length === 0 ? (
        <div className="empty-state">No users found.</div>
      ) : (
        <div className="table">
          <div className="tr head">
            <div>#</div>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
          </div>

          {users.map((u, i) => (
            <div key={u._id} className="tr">
              <div>{i + 1}</div>
              <div>{u.name}</div>
              <div>{u.email}</div>
              <div
                style={{
                  fontWeight: "600",
                  color:
                    u.role === "ADMIN"
                      ? "#ef4444"
                      : u.role === "VIP"
                      ? "#eab308"
                      : "#22c55e",
                }}
              >
                {u.role}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
