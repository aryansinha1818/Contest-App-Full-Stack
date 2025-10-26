import React from "react";
import { Link } from "react-router-dom";

export default function ContestCard({ c }) {
  return (
    <article className="card">
      <div className="card-hed">
        <h3>{c.name}</h3>
        <span className="pill">{c.type}</span>
      </div>
      <p className="muted">{c.description}</p>
      <div className="card-foot">
        <div className="meta">Prize: {c.prize || "—"}</div>
        <Link to={`/contests/${c._id}`} className="link">
          View
        </Link>
      </div>
    </article>
  );
}
