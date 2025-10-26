import React, { useState } from "react";
import { post } from "../api";

export default function CreateContest() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "NORMAL",
    startTime: "",
    endTime: "",
    prize: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await post("/contests", form, token);
    if (res.contest) setMessage("Contest created successfully ✅");
    else setMessage(res.message || "Failed to create contest ❌");
  };

  return (
    <section className="auth-card">
      <h2>Create Contest</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" onChange={handleChange} required />

        <label>Description</label>
        <textarea
          name="description"
          onChange={handleChange}
          rows="3"
          required
        ></textarea>

        <label>Type</label>
        <select name="type" onChange={handleChange}>
          <option value="NORMAL">Normal</option>
          <option value="VIP">VIP</option>
        </select>

        <label>Start Time</label>
        <input type="datetime-local" name="startTime" onChange={handleChange} />

        <label>End Time</label>
        <input type="datetime-local" name="endTime" onChange={handleChange} />

        <label>Prize</label>
        <input name="prize" onChange={handleChange} />

        <button className="btn" type="submit">
          Create Contest
        </button>
      </form>
      {message && (
        <div className="muted" style={{ marginTop: 10 }}>
          {message}
        </div>
      )}
    </section>
  );
}
