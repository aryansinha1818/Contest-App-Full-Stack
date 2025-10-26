import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import CreateContest from "./pages/CreateContest";
import AddQuestion from "./pages/AddQuestion";
import Users from "./pages/Users";
import ContestQuestions from "./pages/ContestQuestions";
import History from "./pages/History";

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/contests" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/contests" element={<Contests />} />
          <Route path="/contests/:id" element={<ContestDetail />} />

          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-contest"
            element={
              <PrivateRoute>
                <CreateContest />
              </PrivateRoute>
            }
          />

          <Route
            path="/add-question"
            element={
              <PrivateRoute>
                <AddQuestion />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-question/:contestId"
            element={
              <PrivateRoute>
                <AddQuestion />
              </PrivateRoute>
            }
          />

          <Route path="/users" element={<Users />} />
          <Route
            path="/contests/:id/questions"
            element={<ContestQuestions />}
          />

          <Route path="/history" element={<History />} />
          <Route
            path="/edit-question/:questionId"
            element={
              <PrivateRoute>
                <AddQuestion editMode={true} />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}
