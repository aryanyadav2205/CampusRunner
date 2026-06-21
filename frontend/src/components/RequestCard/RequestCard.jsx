import React from "react";
import { Link } from "react-router-dom";
import { Package, MapPin, ArrowRight, IndianRupee } from "lucide-react";
import StatusBadge from "../StatusBadge/StatusBadge";

export default function RequestCard({ request, onAccept, showAcceptButton = false }) {
  const isCOD = request.order_type === "COD";

  return (
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
    }}
    className="request-card-hover"
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
            Reward
          </span>
          <div style={{ display: "flex", alignItems: "center", color: "#22c55e", fontWeight: "700", fontSize: "1.2rem" }}>
            <IndianRupee size={16} />
            <span>{request.reward_offered}</span>
          </div>
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
              onClick={() => onAccept(request.id)}
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
  );
}
