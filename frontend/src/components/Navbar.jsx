import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userUpdated"));
    setUser(null);
    navigate("/login");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "#ef4444";
      case "VIP":
        return "#eab308";
      case "NORMAL":
        return "#22c55e";
      default:
        return "#14b8a6";
    }
  };

  const roleColor = getRoleColor(user?.role);

  return (
    <header className="navbar">
      <div className="nav-left">
        <h1 className="brand" onClick={() => navigate("/")}>
          Contest<span className="accent">Hub</span>
        </h1>

        <nav>
          <Link to="/contests">Contests</Link>
          <Link to="/leaderboard">Leaderboard</Link>

          {user && <Link to="/history">History</Link>}

          {user?.role === "ADMIN" && (
            <>
              <Link to="/create-contest">Create Contest</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/users">Users</Link>
            </>
          )}
        </nav>
      </div>

      <div className="nav-right">
        {user ? (
          <div className="user-box">
            <div
              className="user-initial"
              style={{ backgroundColor: roleColor }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role" style={{ color: roleColor }}>
                {user?.role}
              </div>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              ⎋
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn small ghost">
              Login
            </Link>
            <Link to="/register" className="btn small">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
