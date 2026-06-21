import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { 
  Users, AlertCircle, ShieldAlert, CreditCard, 
  ArrowLeft, CheckCircle2, RefreshCw, Star, Ban, Undo2 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Admin() {
  const [activeView, setActiveView] = useState("users"); // "users", "requests", "finance"
  const [usersList, setUsersList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAdminData = async () => {
    try {
      if (activeView === "users") {
        const users = await apiCall("/admin/users", "GET");
        setUsersList(users);
      } else if (activeView === "requests") {
        const requests = await apiCall("/admin/requests", "GET");
        setRequestsList(requests);
      } else if (activeView === "finance") {
        const stats = await apiCall("/admin/revenue", "GET");
        setRevenueStats(stats);
      }
    } catch (error) {
      console.error("Failed to load admin view data:", error);
      alert(error.message || "Unauthorized or connection error.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAdminData();
  }, [activeView]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  const handleSuspendToggle = async (userId, currentlySuspended) => {
    const actionWord = currentlySuspended ? "restore" : "suspend";
    const reason = window.prompt(`Enter reason to ${actionWord} user ID ${userId}:`, "Violation of platform policies.");
    if (reason === null) return; // Cancelled

    try {
      await apiCall(`/admin/users/${userId}/suspend`, "POST", {
        suspend: !currentlySuspended,
        reason: reason
      });
      alert(`User ${actionWord}d successfully.`);
      loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to update suspension status.");
    }
  };

  return (
    <div style={{
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "2rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link to="/dashboard" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: "4px" }}>
            <ArrowLeft size={20} />
          </Link>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "#a855f7" }}>
            Admin Control Center
          </h2>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: "none", border: "none", color: "var(--text-secondary)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem"
          }}
        >
          <RefreshCw size={14} className={refreshing ? "spin-animation" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        padding: "4px",
        borderRadius: "12px",
        gap: "4px"
      }}>
        <button
          onClick={() => setActiveView("users")}
          style={{
            flex: 1,
            background: activeView === "users" ? "rgba(168, 85, 247, 0.1)" : "transparent",
            color: activeView === "users" ? "#c084fc" : "var(--text-secondary)",
            border: activeView === "users" ? "1px solid rgba(168, 85, 247, 0.2)" : "none",
            borderRadius: "8px",
            padding: "10px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <Users size={16} />
          <span>User Profiles</span>
        </button>

        <button
          onClick={() => setActiveView("requests")}
          style={{
            flex: 1,
            background: activeView === "requests" ? "rgba(168, 85, 247, 0.1)" : "transparent",
            color: activeView === "requests" ? "#c084fc" : "var(--text-secondary)",
            border: activeView === "requests" ? "1px solid rgba(168, 85, 247, 0.2)" : "none",
            borderRadius: "8px",
            padding: "10px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <AlertCircle size={16} />
          <span>Parcel Runs Audit</span>
        </button>

        <button
          onClick={() => setActiveView("finance")}
          style={{
            flex: 1,
            background: activeView === "finance" ? "rgba(168, 85, 247, 0.1)" : "transparent",
            color: activeView === "finance" ? "#c084fc" : "var(--text-secondary)",
            border: activeView === "finance" ? "1px solid rgba(168, 85, 247, 0.2)" : "none",
            borderRadius: "8px",
            padding: "10px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <CreditCard size={16} />
          <span>Revenue Stats</span>
        </button>
      </div>

      {/* Main panel loading state */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
          <p>Fetching admin logs...</p>
        </div>
      ) : (
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          overflowX: "auto"
        }}>
          {/* USER MANAGEMENT VIEW */}
          {activeView === "users" && (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "10px" }}>ID</th>
                  <th style={{ padding: "10px" }}>Name / Phone</th>
                  <th style={{ padding: "10px" }}>Registration</th>
                  <th style={{ padding: "10px" }}>Hostel Drop</th>
                  <th style={{ padding: "10px" }}>Reputation</th>
                  <th style={{ padding: "10px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr key={usr.id} style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                    <td style={{ padding: "12px 10px" }}>{usr.id}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <strong style={{ display: "block" }}>{usr.full_name || "(No Name)"}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{usr.phone_number}</span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>{usr.registration_number || "N/A"}</td>
                    <td style={{ padding: "12px 10px" }}>
                      {usr.hostel ? `${usr.hostel} (${usr.room_number})` : "N/A"}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <div style={{ display: "flex", gap: "10px", fontSize: "0.8rem" }}>
                        <span style={{ color: "#eab308" }}>★ O: {usr.rating_owner}</span>
                        <span style={{ color: "#eab308" }}>★ R: {usr.rating_runner}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {usr.is_admin ? (
                        <span style={{ fontSize: "0.75rem", color: "#a855f7", fontWeight: "600" }}>Admin Account</span>
                      ) : (
                        <button
                          onClick={() => handleSuspendToggle(usr.id, usr.is_suspended)}
                          style={{
                            background: usr.is_suspended ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: usr.is_suspended ? "#22c55e" : "#ef4444",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          {usr.is_suspended ? <Undo2 size={12} /> : <Ban size={12} />}
                          <span>{usr.is_suspended ? "Unsuspend" : "Suspend"}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* REQUESTS AUDIT VIEW */}
          {activeView === "requests" && (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "10px" }}>Request ID</th>
                  <th style={{ padding: "10px" }}>Courier Info</th>
                  <th style={{ padding: "10px" }}>Owner ID</th>
                  <th style={{ padding: "10px" }}>Runner ID</th>
                  <th style={{ padding: "10px" }}>Total Price</th>
                  <th style={{ padding: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requestsList.map((req) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                    <td style={{ padding: "12px 10px" }}>
                      <Link to={`/requests/${req.id}`} style={{ color: "var(--primary-color)", fontWeight: "600", textDecoration: "none" }}>
                        #{req.id}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <strong style={{ display: "block" }}>{req.courier_company}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Track: {req.tracking_number}</span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>User {req.owner_id}</td>
                    <td style={{ padding: "12px 10px" }}>{req.runner_id ? `User ${req.runner_id}` : "Unassigned"}</td>
                    <td style={{ padding: "12px 10px", fontWeight: "600" }}>₹{req.total_amount}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* REVENUE STATISTICS VIEW */}
          {activeView === "finance" && revenueStats && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="form-grid">
                
                <div style={{
                  background: "rgba(168, 85, 247, 0.05)",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                  borderRadius: "16px",
                  padding: "1.5rem"
                }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Total Platform Fees Collected (Gross)
                  </span>
                  <span style={{ fontSize: "2rem", fontWeight: "800", color: "#c084fc", display: "flex", alignItems: "center" }}>
                    ₹{revenueStats.total_platform_fees.toFixed(2)}
                  </span>
                  <p style={{ margin: "10px 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Calculated from 10% prepaid service fees and 10% + ₹10 COD service fees.
                  </p>
                </div>

                <div style={{
                  background: "rgba(56, 189, 248, 0.05)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  borderRadius: "16px",
                  padding: "1.5rem"
                }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Total COD cash processed
                  </span>
                  <span style={{ fontSize: "2rem", fontWeight: "800", color: "#38bdf8", display: "flex", alignItems: "center" }}>
                    ₹{revenueStats.total_cod_handled.toFixed(2)}
                  </span>
                  <p style={{ margin: "10px 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Funds collected and distributed to runners for cash-on-delivery tasks.
                  </p>
                </div>

              </div>

              {/* Volume list */}
              <div>
                <h4 style={{ margin: "0 0 10px 0", color: "var(--text-primary)", fontSize: "1rem" }}>
                  Delivery Requests State Volume
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }} className="form-grid">
                  {Object.entries(revenueStats.request_volume).map(([statusName, count]) => (
                    <div key={statusName} style={{
                      background: "rgba(15, 23, 42, 0.3)",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      textAlign: "center"
                    }}>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "4px" }}>
                        {statusName.replace(/_/g, " ")}
                      </span>
                      <strong style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
