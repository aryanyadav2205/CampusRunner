import React, { useState, useRef, useEffect } from "react";
import { Lock, X } from "lucide-react";

export default function OTPModal({ isOpen, onClose, onVerify, title = "Verification Required", description = "Please enter the code." }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", ""]);
      setError("");
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Only numbers
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace focus previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 4) {
      setError("Please enter all 4 digits.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onVerify(fullOtp);
    } catch (err) {
      setError(err.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      animation: "fadeIn 0.2s ease-out"
    }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        padding: "2rem",
        width: "90%",
        maxWidth: "360px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        position: "relative"
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px", right: "12px",
            background: "none", border: "none",
            color: "var(--text-secondary)", cursor: "pointer"
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            background: "rgba(168, 85, Purple, 0.1)",
            color: "#a855f7",
            padding: "12px",
            borderRadius: "50%",
            width: "fit-content",
            margin: "0 auto 10px auto"
          }}>
            <Lock size={24} />
          </div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)" }}>
            {title}
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {description}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  width: "50px",
                  height: "50px",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  textAlign: "center",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                className="otp-input-focus"
              />
            ))}
          </div>

          {error && (
            <div style={{
              color: "#ef4444",
              fontSize: "0.8rem",
              textAlign: "center",
              fontWeight: "600"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--primary-color)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
