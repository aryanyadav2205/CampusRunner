import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LogOut, LayoutDashboard, User, ShieldAlert, Award, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      background: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-color)",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    }}>
      <Link to="/" style={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "1.25rem",
        fontWeight: "800",
        background: "linear-gradient(135deg, #22c55e, #4ade80)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-0.025em"
      }}>
        <img
          src="/logo.png"
          alt="Campus Runner Logo"
          style={{
            height: "64px",
            width: "auto",
            objectFit: "contain",
            WebkitTextFillColor: "initial"
          }}
        />
        CAMPUS RUNNER
      </Link>

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link to="/dashboard" style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-primary)",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "color 0.2s"
          }}
          className="nav-link-hover"
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>

          <Link to="/profile" style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-primary)",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "color 0.2s"
          }}
          className="nav-link-hover"
          >
            <User size={16} />
            <span>Profile</span>
          </Link>

          {user.is_admin && (
            <Link to="/admin" style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#a855f7",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              background: "rgba(168, 85, 247, 0.1)",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid rgba(168, 85, 247, 0.2)"
            }}>
              <ShieldAlert size={16} />
              <span>Admin</span>
            </Link>
          )}

          <div style={{
            width: "1px",
            height: "20px",
            background: "var(--border-color)"
          }} />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            style={{
              background: "var(--bg-elevated, rgba(255,255,255,0.05))",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all 0.2s"
            }}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* User profile brief */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                {user.full_name || "New User"}
              </span>
              <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                {user.phone_number}
              </span>
            </div>
            <button
              onClick={handleLogoutClick}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                transition: "color 0.2s, background-color 0.2s"
              }}
              className="logout-button-hover"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
