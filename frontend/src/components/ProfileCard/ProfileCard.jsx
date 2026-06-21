import React from "react";
import { User as UserIcon, Star, CheckCircle, ShieldAlert, BadgeInfo } from "lucide-react";

export default function ProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      borderRadius: "16px",
      padding: "1.5rem",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      backdropFilter: "blur(10px)",
      color: "var(--text-primary)",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem"
    }}>
      {/* Profile Header */}
      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "1.5rem",
          fontWeight: "600",
          boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)"
        }}>
          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon size={24} />}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>
              {profile.full_name || "Profile Incomplete"}
            </h3>
            {profile.is_verified && (
              <CheckCircle size={16} fill="#22c55e" color="#1e293b" title="Verified Student" />
            )}
            {profile.is_suspended && (
              <ShieldAlert size={16} fill="#ef4444" color="#1e293b" title="Suspended Account" />
            )}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Reg: {profile.registration_number || "N/A"}
          </span>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Hostel: {profile.hostel || "N/A"} | Room: {profile.room_number || "N/A"}
          </div>
        </div>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid var(--border-color)", margin: "0" }} />

      {/* Grid Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem"
      }}>
        {/* Owner Side */}
        <div style={{
          background: "rgba(15, 23, 42, 0.3)",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.02)"
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            As Owner (Courier)
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "1rem", fontWeight: "700", color: "#eab308" }}>
            <Star size={14} fill="#eab308" />
            <span>{profile.rating_owner}</span>
          </div>
          <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
            Success: <strong style={{ color: "#38bdf8" }}>{profile.success_rate_owner}%</strong>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Receipts: {profile.completed_receipts || 0}
          </div>
        </div>

        {/* Runner Side */}
        <div style={{
          background: "rgba(15, 23, 42, 0.3)",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.02)"
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
            As Runner (Deliverer)
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "1rem", fontWeight: "700", color: "#eab308" }}>
            <Star size={14} fill="#eab308" />
            <span>{profile.rating_runner}</span>
          </div>
          <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
            Success: <strong style={{ color: "#38bdf8" }}>{profile.success_rate_runner}%</strong>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Deliveries: {profile.completed_deliveries || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
