import React, { useState, useEffect } from "react";
import { post } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("NORMAL");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const res = await post("/auth/register", { name, email, password, role });
    if (res.user) nav("/login");
    else setErr(res.message || res.error || "Registration failed");
  };

  const [adminExists, setAdminExists] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5050/api/auth/check-admin")
      .then((res) => res.json())
      .then((data) => setAdminExists(data.exists))
      .catch(() => setAdminExists(true));
  }, []);

  const isAdminAllowed = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    return !adminExists || loggedInUser.role === "ADMIN";
  };

  return (
    <section className="auth-card">
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="NORMAL">Normal</option>
          <option value="VIP">VIP</option>
          {isAdminAllowed() && <option value="ADMIN">Admin</option>}
        </select>
        {err && <div className="err">{err}</div>}
        <button className="btn" type="submit">
          Sign up
        </button>
      </form>
    </section>
  );
}
