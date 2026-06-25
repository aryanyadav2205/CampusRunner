import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, Lock, Mail, ArrowRight, ShieldCheck, Zap, Headphones } from "lucide-react";
import "../Login/Login.css"; // Reuse the main login CSS

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminLogin(email, password);
      // On success, redirect directly to admin dashboard
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ===== Left Hero Panel (Admin Themed) ===== */}
      <div className="login-hero">
        <div className="login-hero-content">
          <Link to="/" className="login-hero-logo">
            <img src="/logo.png" alt="Campus Runner" />
            <span>Campus Runner</span>
          </Link>

          <div className="login-hero-badge">
            <ShieldCheck size={14} />
            Authorized Personnel Only
          </div>

          <h1>
            Platform Control <span className="highlight">Center.</span>
          </h1>

          <p className="login-hero-text">
            Secure login portal for system administrators to manage deliveries, users, and platform revenue.
          </p>

          <ul className="login-hero-features">
            <li>
              <span className="feature-icon"><ShieldCheck size={13} /></span>
              End-to-End Encryption
            </li>
            <li>
              <span className="feature-icon"><ShieldCheck size={13} /></span>
              Real-time Ledger Sync
            </li>
            <li>
              <span className="feature-icon"><ShieldCheck size={13} /></span>
              Full Access Control
            </li>
          </ul>
        </div>
      </div>

      {/* ===== Right Form Panel ===== */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={24} color="var(--primary-color)" /> Admin Portal
            </h2>
            <p>Enter your master credentials to securely log in.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label>Admin Email</label>
              <div className="login-input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="campusrunner4@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label>Master Password</label>
              <div className="login-input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" disabled={loading} className="login-submit-btn">
              {loading ? "Authenticating..." : "Secure Login"}
              <ArrowRight size={16} />
            </button>

            <p className="login-terms" style={{ marginTop: "1.5rem" }}>
              <Link to="/login">Not an admin? Return to Student Login</Link>
            </p>
          </form>

          {/* Trust Indicators */}
          <div className="login-trust-bar">
            <div className="login-trust-item">
              <div className="trust-icon" style={{ color: "var(--primary-color)" }}><Shield size={16} /></div>
              <span className="trust-title">Protected</span>
              <span className="trust-desc">Action Logged</span>
            </div>
            <div className="login-trust-item">
              <div className="trust-icon" style={{ color: "var(--primary-color)" }}><Zap size={16} /></div>
              <span className="trust-title">Secure Auth</span>
              <span className="trust-desc">Token verified</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
