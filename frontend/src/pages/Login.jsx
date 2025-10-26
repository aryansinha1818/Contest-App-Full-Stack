import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await post("/auth/login", { email, password });

      if (res?.token && res?.user) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        window.dispatchEvent(new Event("userUpdated"));

        navigate("/contests");
      } else {
        setErr(res?.message || "Invalid login credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErr("Something went wrong. Try again.");
    }
  };

  return (
    <section className="auth-card">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input
          type="email"
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

        {err && <div className="err">{err}</div>}

        <button className="btn" type="submit">
          Login
        </button>
      </form>
    </section>
  );
}
