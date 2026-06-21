import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../services/api";
import {
  User, IdCard, Home, Camera, Phone, ChevronLeft,
  ArrowRight, CheckCircle2, HelpCircle, Check
} from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fromLogin = location.state?.fromLogin || false;

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [regNumber, setRegNumber] = useState(user?.registration_number || "");
  const [phoneNumber] = useState(user?.phone_number || "");
  const [hostel, setHostel] = useState(user?.hostel || "");
  const [roomNumber, setRoomNumber] = useState(user?.room_number || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Hostel Details" },
    { num: 3, label: "Almost Done" },
  ];

  const getStepState = (stepNum) => {
    if (stepNum < currentStep) return "completed";
    if (stepNum === currentStep) return "active";
    return "inactive";
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (!fullName.trim()) { setError("Full name is required."); return; }
      if (!regNumber.trim()) { setError("Registration number is required."); return; }
    }
    if (currentStep === 2) {
      if (!hostel.trim()) { setError("Hostel name is required."); return; }
      if (!roomNumber.trim()) { setError("Room number is required."); return; }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await apiCall("/profile", "PUT", {
        full_name: fullName,
        registration_number: regNumber,
        hostel: hostel,
        room_number: roomNumber,
        profile_photo: null,
      });

      updateProfile(result);
      setSuccess("Profile saved successfully! Redirecting...");

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <Link to="/" className="profile-header-logo">
          <img src="/logo.png" alt="Campus Runner" />
          <span>Campus Runner</span>
        </Link>
        <button
          className="profile-back-btn"
          onClick={() => {
            if (currentStep > 1) handleBack();
            else navigate(-1);
          }}
        >
          <ChevronLeft size={16} />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Stepper */}
        <div className="profile-stepper">
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className={`stepper-step ${getStepState(step.num)}`}>
                <div className="stepper-circle">
                  {getStepState(step.num) === "completed" ? (
                    <Check size={18} />
                  ) : (
                    step.num
                  )}
                </div>
                <span className="stepper-label">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`stepper-line ${
                    step.num < currentStep ? "active" : "inactive"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <>
            <div className="profile-section-title">
              <h2>Let's set up your profile! 👋</h2>
              <p>Help us personalize your experience</p>
            </div>

            <div className="profile-form-card">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-primary)" }}>
                Basic Information
              </h3>

              <div className="profile-photo-upload">
                <div className="profile-photo-circle">
                  <Camera size={28} />
                </div>
                <span className="profile-photo-label">Upload Photo</span>
                <span className="profile-photo-label">JPG, PNG up to 5MB</span>
              </div>

              <div className="profile-input-group">
                <label>Full Name</label>
                <div className="profile-input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Aryab Singh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label>Student Registration Number</label>
                <div className="profile-input-wrapper">
                  <IdCard size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. 12408182"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label>Phone Number</label>
                <div className="profile-input-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    placeholder="+91 9350535328"
                    value={phoneNumber}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
              </div>
            </div>

            <div className="profile-info-box">
              <HelpCircle size={18} className="info-icon" />
              <div>
                <strong>Why do we need this?</strong><br />
                This helps us verify you as a student and build a trusted community.
              </div>
            </div>

            {error && <div className="profile-error">{error}</div>}

            <button className="profile-submit-btn" onClick={handleNext}>
              Continue
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* Step 2: Hostel Details */}
        {currentStep === 2 && (
          <>
            <div className="profile-section-title">
              <h2>Where do you stay? 🏠</h2>
              <p>Your default delivery drop location</p>
            </div>

            <div className="profile-form-card">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-primary)" }}>
                Hostel Details
              </h3>

              <div className="profile-input-group">
                <label>Hostel Name</label>
                <div className="profile-input-wrapper">
                  <Home size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. BH-4, Bhabha Hostel"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label>Room Number</label>
                <div className="profile-input-wrapper">
                  <Home size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Room 312"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && <div className="profile-error">{error}</div>}

            <button className="profile-submit-btn" onClick={handleNext}>
              Continue
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <>
            <div className="profile-section-title">
              <h2>Almost Done! ✅</h2>
              <p>Review your details and save</p>
            </div>

            <div className="profile-form-card">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-primary)" }}>
                Review Your Profile
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: "10px", background: "var(--bg-elevated)"
                }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Full Name</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{fullName}</span>
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: "10px", background: "var(--bg-elevated)"
                }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Registration No.</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{regNumber}</span>
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: "10px", background: "var(--bg-elevated)"
                }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Hostel</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{hostel}</span>
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: "10px", background: "var(--bg-elevated)"
                }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Room Number</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{roomNumber}</span>
                </div>
              </div>
            </div>

            {error && <div className="profile-error">{error}</div>}
            {success && <div className="profile-success">{success}</div>}

            <button
              className="profile-submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save & Continue"}
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
