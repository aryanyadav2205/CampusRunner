import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sendOTP } from "../../services/auth";
import {
  Mail, Phone, Lock, Send, ChevronRight, Shield,
  Zap, Headphones, CheckCircle2, Users, Sparkles
} from "lucide-react";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      setLoading(false);
      return;
    }

    try {
      await sendOTP(email, phone);
      setSuccessMsg("OTP sent! Check your email inbox.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otp || otp.length !== 4) {
      setError("Please enter a 4-digit OTP code.");
      setLoading(false);
      return;
    }

    try {
      const loggedUser = await login(email, otp);
      setSuccessMsg("Verification success!");

      if (!loggedUser.full_name || !loggedUser.registration_number || !loggedUser.hostel || !loggedUser.room_number) {
        navigate("/profile", { state: { fromLogin: true } });
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ===== Left Hero Panel ===== */}
      <div className="login-hero">
        <div className="login-hero-content">
          <Link to="/" className="login-hero-logo">
            <img src="/logo.png" alt="Campus Runner" />
            <span>Campus Runner</span>
          </Link>

          <div 
            className="login-hero-badge"
            style={{ cursor: "pointer" }}
            onClick={() => setIsSignUp(true)}
          >
            <Users size={14} />
            New here? Sign up
          </div>

          <h1>
            Someone's already going.{" "}
            <span className="highlight">Let them bring yours too.</span>
          </h1>

          <p className="login-hero-text">
            The fastest & most trusted way to get your parcels delivered across campus.
          </p>

          <ul className="login-hero-features">
            <li>
              <span className="feature-icon"><CheckCircle2 size={13} /></span>
              Verified Student Community
            </li>
            <li>
              <span className="feature-icon"><CheckCircle2 size={13} /></span>
              Secure OTP Verification
            </li>
            <li>
              <span className="feature-icon"><CheckCircle2 size={13} /></span>
              Safe & Fast Deliveries
            </li>
            <li>
              <span className="feature-icon"><CheckCircle2 size={13} /></span>
              Earn Money on Every Trip
            </li>
          </ul>

          <div className="login-hero-trust">
            <span className="trust-number">5000+</span>
            <span className="trust-label">Trusted by<br />Students</span>
          </div>
        </div>
      </div>

      {/* ===== Right Form Panel ===== */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
            <p>{isSignUp ? "Sign up to start delivering happiness" : "Login to continue delivering happiness"}</p>
          </div>

          {/* Step 1: Email & Phone */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="login-input-group">
                <label>Email Address</label>
                <div className="login-input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label>Phone Number</label>
                <div className="login-input-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input
                    id="login-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" disabled={loading} className="login-submit-btn">
                {loading ? "Sending..." : "Send OTP"}
                <Send size={16} />
              </button>

              <p className="login-terms" style={{ marginTop: "1.5rem" }}>
                {isSignUp ? "Already have an account? " : "New here? "}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
                  {isSignUp ? "Log in" : "Sign up"}
                </a>
              </p>
              
              <p className="login-terms" style={{ marginTop: "0.5rem", fontSize: "0.7rem" }}>
                By continuing, you agree to our <a href="#">Terms of Service</a>
              </p>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="login-otp-info">
                <Sparkles size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Check your inbox:</strong> We've sent a 4-digit code to <strong>{email}</strong>. Enter it below to log in.
                </div>
              </div>

              <div className="login-input-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label>Enter 4-Digit OTP</label>
                  <button
                    type="button"
                    className="login-change-btn"
                    onClick={() => { setStep(1); setOtp(""); setError(""); setSuccessMsg(""); }}
                  >
                    Change Details
                  </button>
                </div>
                <div className="login-input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="login-otp"
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4 digits"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ letterSpacing: "0.2em" }}
                    required
                  />
                </div>
              </div>

              {successMsg && <div className="login-success">{successMsg}</div>}
              {error && <div className="login-error">{error}</div>}

              <button type="submit" disabled={loading} className="login-submit-btn">
                {loading ? "Verifying..." : "Verify & Login"}
                <ChevronRight size={16} />
              </button>
            </form>
          )}

          {/* Trust Indicators */}
          <div className="login-trust-bar">
            <div className="login-trust-item">
              <div className="trust-icon"><Shield size={16} /></div>
              <span className="trust-title">100% Secure</span>
              <span className="trust-desc">Your data is protected</span>
            </div>
            <div className="login-trust-item">
              <div className="trust-icon"><Zap size={16} /></div>
              <span className="trust-title">Instant Verification</span>
              <span className="trust-desc">Quick OTP delivery</span>
            </div>
            <div className="login-trust-item">
              <div className="trust-icon"><Headphones size={16} /></div>
              <span className="trust-title">24/7 Support</span>
              <span className="trust-desc">We're here to help</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
