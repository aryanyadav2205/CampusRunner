import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, MapPin, ArrowRight, IndianRupee, X, AlertCircle } from "lucide-react";
import StatusBadge from "../StatusBadge/StatusBadge";

export default function RequestCard({ request, onAccept, showAcceptButton = false }) {
  const isCOD = request.order_type === "COD";
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const runnerPayout = request.runner_payout ?? request.reward_offered;
  const rewardOffered = request.reward_offered;
  const deduction = Math.round((rewardOffered - runnerPayout) * 100) / 100;

  const handleAcceptClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmAccept = () => {
    setShowConfirm(false);
    onAccept(request.id);
  };

  return (
    <>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        padding: "1.25rem",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(5px)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "transform 0.2s, border-color 0.2s",
        cursor: "pointer",
      }}
      className="request-card-hover"
      onClick={() => navigate(`/requests/${request.id}`)}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{
              background: "rgba(99, 102, 241, 0.1)",
              padding: "8px",
              borderRadius: "8px",
              color: "var(--primary-color)"
            }}>
              <Package size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)" }}>
                {request.courier_company}
              </h4>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Track: {request.tracking_number}
              </span>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Path */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(15, 23, 42, 0.3)",
          padding: "10px",
          borderRadius: "8px",
          fontSize: "0.85rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-primary)" }}>
            <MapPin size={14} style={{ color: "#38bdf8" }} />
            <span>{request.pickup_location}</span>
          </div>
          <ArrowRight size={14} style={{ color: "var(--text-secondary)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-primary)" }}>
            <MapPin size={14} style={{ color: "#f43f5e" }} />
            <span>{request.hostel} ({request.room_number})</span>
          </div>
        </div>

        {/* Price and Action */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto"
        }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Earn
            </span>
            <div style={{ display: "flex", alignItems: "center", color: "#22c55e", fontWeight: "700", fontSize: "1.2rem" }}>
              <IndianRupee size={16} />
              <span>{runnerPayout}</span>
            </div>
            <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>
              10% platform fee deducted
            </span>
          </div>

          {isCOD && (
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                COD Pay
              </span>
              <div style={{ display: "flex", alignItems: "center", color: "#eab308", fontWeight: "600", fontSize: "0.95rem" }}>
                <IndianRupee size={12} />
                <span>{request.cod_amount}</span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            {showAcceptButton ? (
              <button
              onClick={(e) => { e.stopPropagation(); handleAcceptClick(); }}
                style={{
                  background: "var(--primary-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                className="btn-hover"
              >
                Accept Run
              </button>
            ) : (
              <Link
                to={`/requests/${request.id}`}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  transition: "background 0.2s"
                }}
              >
                Details
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Earnings Confirmation Modal */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
            animation: "fadeIn 0.2s ease-out"
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "20px",
              padding: "1.75rem",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
              animation: "slideUp 0.25s ease-out"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)" }}>
                Confirm Delivery Run
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                  transition: "background 0.2s"
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Route Info */}
            <div style={{
              background: "rgba(15, 23, 42, 0.4)",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.85rem"
            }}>
              <Package size={16} style={{ color: "var(--primary-color)", flexShrink: 0 }} />
              <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{request.courier_company}</span>
              <span style={{ color: "var(--text-secondary)" }}>•</span>
              <span style={{ color: "var(--text-secondary)" }}>{request.pickup_location} → {request.hostel}</span>
            </div>

            {/* Earnings Breakdown */}
            <div style={{
              background: "rgba(34, 197, 94, 0.05)",
              border: "1px solid rgba(34, 197, 94, 0.15)",
              borderRadius: "14px",
              padding: "1rem",
              marginBottom: "1rem"
            }}>
              <span style={{
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: "10px"
              }}>
                Your Earnings Breakdown
              </span>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Reward Offered</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" }}>₹{rewardOffered}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.85rem", color: "#ef4444" }}>Platform Fee (10%)</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#ef4444" }}>- ₹{deduction}</span>
              </div>

              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#22c55e" }}>You'll Earn</span>
                <span style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: "#22c55e",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <IndianRupee size={18} />
                  {runnerPayout}
                </span>
              </div>
            </div>

            {/* COD Notice */}
            {isCOD && (
              <div style={{
                background: "rgba(234, 179, 8, 0.08)",
                border: "1px solid rgba(234, 179, 8, 0.2)",
                borderRadius: "10px",
                padding: "10px 12px",
                marginBottom: "1rem",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start"
              }}>
                <AlertCircle size={16} style={{ color: "#eab308", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "0.8rem", color: "#eab308", lineHeight: "1.4" }}>
                  This is a <strong>COD order</strong>. You'll need to pay <strong>₹{request.cod_amount}</strong> in cash at the pickup center and collect it back from the owner.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                style={{
                  flex: 1,
                  background: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)"
                }}
                className="btn-hover"
              >
                Accept — Earn ₹{runnerPayout}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
