import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { 
  Users, AlertCircle, ShieldAlert, CreditCard, 
  ArrowLeft, CheckCircle2, RefreshCw, Star, Ban, Undo2, 
  Wallet, Banknote, IndianRupee, Clock, Check,
  Moon, Sun, LogOut, ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../Dashboard/Dashboard.css"; // Reuse the main dashboard CSS

export default function Admin() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("overview"); // "overview", "users", "requests", "payouts"
  const [usersList, setUsersList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
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
      } else if (activeView === "overview") {
        const stats = await apiCall("/admin/revenue", "GET");
        setRevenueStats(stats);
      } else if (activeView === "payouts") {
        const withdrawals = await apiCall("/admin/withdrawals", "GET");
        setWithdrawalsList(withdrawals);
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

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
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

  const handleProcessWithdrawal = async (withdrawalId, action) => {
    const actionStr = action === "APPROVE" ? "approve and mark as PAID" : "REJECT";
    const confirmed = window.confirm(`Are you sure you want to ${actionStr} this withdrawal request?`);
    if (!confirmed) return;

    let notes = "";
    if (action === "REJECT") {
      notes = window.prompt("Enter a reason for rejection (this will be logged and the amount refunded to the runner's wallet):", "Invalid UPI ID");
      if (notes === null) return;
    }

    try {
      await apiCall(`/admin/withdrawals/${withdrawalId}/process`, "POST", {
        action: action,
        notes: notes
      });
      alert(`Withdrawal ${action === "APPROVE" ? "Approved" : "Rejected"} successfully.`);
      loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to process withdrawal.");
    }
  };

  // Sidebar nav items
  const navItems = [
    { id: "overview", icon: Star, label: "Platform Overview" },
    { id: "users", icon: Users, label: "User Profiles" },
    { id: "requests", icon: AlertCircle, label: "Parcel Audits" },
    { id: "payouts", icon: Banknote, label: "Payout Management" },
  ];

  return (
    <div className="dashboard-page">
      {/* ===== Sidebar ===== */}
      <aside className="dash-sidebar">
        <Link to="/" className="dash-sidebar-logo">
          <img src="/logo.png" alt="Campus Runner" />
          <span>Admin Portal</span>
        </Link>

        <nav className="dash-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`dash-nav-item ${activeView === item.id ? "active" : ""}`}
              style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "none", background: "none", fontFamily: "inherit" }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}

          <div className="dash-sidebar-divider" />

          <button className="dash-nav-item logout" onClick={handleLogout} style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "none", background: "none", fontFamily: "inherit" }}>
            <LogOut size={18} />
            Secure Log Out
          </button>
        </nav>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="dash-main">
        {/* Top bar with user info and theme toggle */}
        <div className="dash-user-header">
          <div className="dash-greeting">
            <h1>Admin Control Center</h1>
            <p>Monitor platform health, resolve disputes, and process payouts.</p>
          </div>
          
          <div className="dash-user-info" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="dash-cta-btn"
              style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "8px 12px" }}
            >
              <RefreshCw size={14} className={refreshing ? "spin-animation" : ""} />
            </button>
            <button
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border-color)",
                borderRadius: "8px", width: "34px", height: "34px", display: "flex",
                alignItems: "center", justifyContent: "center", cursor: "pointer",
                color: "var(--text-secondary)", transition: "all 0.2s"
              }}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="dash-user-avatar" style={{ background: "var(--gradient-cta)" }}>
              A
            </div>
            <div>
              <div className="dash-user-name">Administrator</div>
              <div className="dash-user-role" style={{ color: "var(--primary-color)" }}>System Access</div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        {loading ? (
          <div className="dash-empty" style={{ minHeight: "50vh" }}>
            <RefreshCw size={24} className="spin-animation" style={{ marginBottom: 12, color: "var(--primary-color)" }} />
            <p>Fetching encrypted logs...</p>
          </div>
        ) : (
          <div style={{ paddingBottom: "3rem" }}>
            
            {/* OVERVIEW STATISTICS VIEW */}
            {activeView === "overview" && revenueStats && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div className="dash-stats-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
                  
                  <div className="dash-stat-card" style={{ borderTop: "4px solid var(--primary-color)" }}>
                    <div className="dash-stat-value" style={{ color: "var(--primary-color)", fontSize: "1.8rem" }}>{revenueStats.total_users}</div>
                    <div className="dash-stat-label">Total Users</div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "8px", marginBottom: 0 }}>{revenueStats.active_runners} active runners.</p>
                  </div>

                  <div className="dash-stat-card" style={{ borderTop: "4px solid #38bdf8" }}>
                    <div className="dash-stat-value" style={{ color: "#38bdf8", fontSize: "1.8rem" }}>₹{revenueStats.system_liability.toFixed(2)}</div>
                    <div className="dash-stat-label">System Liability</div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "8px", marginBottom: 0 }}>Unwithdrawn runner wallets.</p>
                  </div>

                  <div className="dash-stat-card" style={{ borderTop: "4px solid #22c55e" }}>
                    <div className="dash-stat-value" style={{ color: "#22c55e", fontSize: "1.8rem" }}>₹{revenueStats.total_platform_fees.toFixed(2)}</div>
                    <div className="dash-stat-label">Gross Revenue</div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "8px", marginBottom: 0 }}>All platform fees collected.</p>
                  </div>

                  <div className="dash-stat-card" style={{ borderTop: "4px solid #eab308" }}>
                    <div className="dash-stat-value" style={{ color: "#eab308", fontSize: "1.8rem" }}>₹{revenueStats.total_cod_handled.toFixed(2)}</div>
                    <div className="dash-stat-label">COD Handled</div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "8px", marginBottom: 0 }}>Total cash exchanged.</p>
                  </div>

                </div>

                {/* Volume list */}
                <div>
                  <h3 className="dash-section-header" style={{ margin: "1rem 0" }}>Delivery Status Volume</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
                    {Object.entries(revenueStats.request_volume).map(([statusName, count]) => (
                      <div key={statusName} style={{
                        background: "var(--bg-card)",
                        padding: "1rem",
                        borderRadius: "12px",
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

            {/* USER MANAGEMENT VIEW */}
            {activeView === "users" && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", background: "rgba(0,0,0,0.1)" }}>
                      <th style={{ padding: "12px 16px" }}>ID</th>
                      <th style={{ padding: "12px 16px" }}>Name / Contact</th>
                      <th style={{ padding: "12px 16px" }}>Wallet Bal</th>
                      <th style={{ padding: "12px 16px" }}>Activity</th>
                      <th style={{ padding: "12px 16px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.id} style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                        <td style={{ padding: "16px" }}>{usr.id}</td>
                        <td style={{ padding: "16px" }}>
                          <strong style={{ display: "block" }}>{usr.full_name || "(No Name)"}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{usr.phone_number} | {usr.email}</span>
                        </td>
                        <td style={{ padding: "16px", fontWeight: "600", color: "#22c55e" }}>
                          ₹{(usr.wallet_balance || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ display: "block" }}>Runs: {usr.completed_deliveries}</span>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)" }}>Orders: {usr.completed_receipts}</span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          {usr.is_admin ? (
                            <span style={{ fontSize: "0.75rem", color: "var(--primary-color)", fontWeight: "600" }}>Admin Account</span>
                          ) : (
                            <button
                              onClick={() => handleSuspendToggle(usr.id, usr.is_suspended)}
                              style={{
                                background: usr.is_suspended ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                color: usr.is_suspended ? "#22c55e" : "#ef4444",
                                border: "none", borderRadius: "6px", padding: "6px 12px",
                                cursor: "pointer", fontSize: "0.8rem", fontWeight: "600",
                                display: "inline-flex", alignItems: "center", gap: "4px"
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
              </div>
            )}

            {/* REQUESTS AUDIT VIEW */}
            {activeView === "requests" && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", background: "rgba(0,0,0,0.1)" }}>
                      <th style={{ padding: "12px 16px" }}>Request ID</th>
                      <th style={{ padding: "12px 16px" }}>Courier Info</th>
                      <th style={{ padding: "12px 16px" }}>Owner ID</th>
                      <th style={{ padding: "12px 16px" }}>Runner ID</th>
                      <th style={{ padding: "12px 16px" }}>Price</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestsList.map((req) => (
                      <tr key={req.id} style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                        <td style={{ padding: "16px" }}>
                          <Link to={`/requests/${req.id}`} style={{ color: "var(--primary-color)", fontWeight: "600", textDecoration: "none" }}>
                            #{req.id}
                          </Link>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <strong style={{ display: "block" }}>{req.courier_company}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Track: {req.tracking_number}</span>
                        </td>
                        <td style={{ padding: "16px" }}>User {req.owner_id}</td>
                        <td style={{ padding: "16px" }}>{req.runner_id ? `User ${req.runner_id}` : "Unassigned"}</td>
                        <td style={{ padding: "16px", fontWeight: "600" }}>₹{req.total_amount}</td>
                        <td style={{ padding: "16px" }}>
                          <StatusBadge status={req.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAYOUTS / WITHDRAWALS VIEW */}
            {activeView === "payouts" && (
              <div>
                <div style={{ marginBottom: "1.5rem", padding: "1rem 1.5rem", background: "rgba(56, 189, 248, 0.05)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "12px" }}>
                  <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>Admin Action Required</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    To process a payout: 1) Copy the runner's UPI ID. 2) Open your UPI app (GPay, PhonePe). 3) Send the requested amount. 4) Click "Mark Paid" here to finalize the ledger.
                  </p>
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", background: "rgba(0,0,0,0.1)" }}>
                        <th style={{ padding: "12px 16px" }}>Date</th>
                        <th style={{ padding: "12px 16px" }}>Runner ID</th>
                        <th style={{ padding: "12px 16px" }}>Amount</th>
                        <th style={{ padding: "12px 16px" }}>UPI ID</th>
                        <th style={{ padding: "12px 16px" }}>Status</th>
                        <th style={{ padding: "12px 16px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalsList.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                            No withdrawal requests found.
                          </td>
                        </tr>
                      )}
                      {withdrawalsList.map((wd) => (
                        <tr key={wd.id} style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                          <td style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            {new Date(wd.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: "16px" }}>User {wd.user_id}</td>
                          <td style={{ padding: "16px", fontWeight: "800", color: "#eab308" }}>₹{wd.amount.toFixed(2)}</td>
                          <td style={{ padding: "16px" }}>
                            <code style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-color)", padding: "4px 8px", borderRadius: "6px", color: "var(--primary-color)", userSelect: "all" }}>
                              {wd.upi_id}
                            </code>
                          </td>
                          <td style={{ padding: "16px" }}>
                            {wd.status === "PENDING" && <span style={{ color: "#38bdf8", fontWeight: "600", fontSize: "0.75rem", background: "rgba(56, 189, 248, 0.1)", padding: "4px 8px", borderRadius: "6px" }}><Clock size={10} style={{marginRight:"4px", verticalAlign:"-1px"}}/> PENDING</span>}
                            {wd.status === "COMPLETED" && <span style={{ color: "#22c55e", fontWeight: "600", fontSize: "0.75rem", background: "rgba(34, 197, 94, 0.1)", padding: "4px 8px", borderRadius: "6px" }}><Check size={10} style={{marginRight:"4px", verticalAlign:"-1px"}}/> PAID</span>}
                            {wd.status === "REJECTED" && <span style={{ color: "#ef4444", fontWeight: "600", fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.1)", padding: "4px 8px", borderRadius: "6px" }}><Ban size={10} style={{marginRight:"4px", verticalAlign:"-1px"}}/> REJECTED</span>}
                          </td>
                          <td style={{ padding: "16px" }}>
                            {wd.status === "PENDING" && (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  onClick={() => handleProcessWithdrawal(wd.id, "APPROVE")}
                                  style={{
                                    background: "rgba(34, 197, 94, 0.1)", color: "#22c55e",
                                    border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "6px",
                                    padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => handleProcessWithdrawal(wd.id, "REJECT")}
                                  style={{
                                    background: "transparent", color: "var(--text-secondary)",
                                    border: "1px solid var(--border-color)", borderRadius: "6px",
                                    padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {wd.status !== "PENDING" && (
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                Processed {new Date(wd.processed_at).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
