import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { listOpenRequests, listMyRequests, acceptRequest } from "../../services/requestService";
import {
  LayoutDashboard, Package, IndianRupee, ClipboardList, MessageSquare,
  Wallet, User, Settings, LogOut, ArrowRight, Plus, RefreshCw,
  Star, Sun, Moon, Send, Bike, Gift, ChevronRight
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [myRequests, setMyRequests] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const [myRes, openRes] = await Promise.all([
        listMyRequests(),
        listOpenRequests(),
      ]);
      setMyRequests(myRes);
      setOpenRequests(openRes);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const firstName = user?.full_name?.split(" ")[0] || "User";

  // Compute stats
  const completedCount = myRequests.filter(
    (r) => r.status === "delivered" || r.status === "completed"
  ).length;
  const totalEarnings = myRequests
    .filter((r) => r.status === "delivered" || r.status === "completed")
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  // Sidebar nav items
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "My Deliveries", path: "/requests/runs" },
    { icon: IndianRupee, label: "My Earnings", path: "/payments" },
    { icon: ClipboardList, label: "My Requests", path: "/requests/my" },
    { icon: MessageSquare, label: "Messages", path: "#", badge: null },
    { icon: Wallet, label: "Wallet", path: "#" },
  ];

  const bottomItems = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "#" },
  ];

  // Get status class for delivery items
  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "completed";
      case "picked_up":
        return "picked-up";
      case "accepted":
      case "in_transit":
        return "out-for-delivery";
      default:
        return "pending";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "Completed";
      case "picked_up":
        return "Picked Up";
      case "accepted":
      case "in_transit":
        return "Out for Delivery";
      default:
        return "Open";
    }
  };

  return (
    <div className="dashboard-page">
      {/* ===== Sidebar ===== */}
      <aside className="dash-sidebar">
        <Link to="/" className="dash-sidebar-logo">
          <img src="/logo.png" alt="Campus Runner" />
          <span>Campus Runner</span>
        </Link>

        <nav className="dash-sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`dash-nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}

          <div className="dash-sidebar-divider" />

          {bottomItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`dash-nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}

          <div className="dash-sidebar-divider" />

          <button className="dash-nav-item logout" onClick={handleLogout}>
            <LogOut size={18} />
            Log Out
          </button>
        </nav>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="dash-main">
        {/* Top bar with user info and theme toggle */}
        <div className="dash-user-header">
          <div className="dash-greeting">
            <h1>Hello, {firstName} 👋</h1>
            <p>Ready to deliver something amazing today?</p>
          </div>
          <div className="dash-user-info">
            <button
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-secondary)",
                transition: "all 0.2s",
                marginRight: "8px",
              }}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="dash-user-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="dash-user-name">{user?.full_name || "User"}</div>
              <div className="dash-user-role">Student</div>
            </div>
          </div>
        </div>

        {/* CTA Cards */}
        <div className="dash-cta-grid">
          <Link to="/create-request" className="dash-cta-card primary">
            <h3>Need Parcel<br />Delivered?</h3>
            <p>Send a parcel to your friend or get it delivered</p>
            <span className="dash-cta-btn">
              Create Request <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/requests/runs" className="dash-cta-card secondary">
            <h3>Earn by<br />Delivering</h3>
            <p>Pick up parcels and earn on every trip</p>
            <span className="dash-cta-btn">
              Start Delivering <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="dash-stats-row">
          <div className="dash-stat-card">
            <div className="dash-stat-value">{completedCount}</div>
            <div className="dash-stat-label">Deliveries<br />Completed</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-value">₹{totalEarnings}</div>
            <div className="dash-stat-label">Earnings<br />This Month</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-value">{user?.average_rating?.toFixed(1) || "4.9"}</div>
            <div className="dash-stat-label">Rating</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-value">{user?.success_rate || "98"}%</div>
            <div className="dash-stat-label">Success<br />Rate</div>
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="dash-section-header">
          <h3>Recent Deliveries</h3>
          <Link to="/requests/my" className="dash-view-all">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="dash-empty">
            <RefreshCw size={20} className="spin-animation" style={{ marginBottom: 8 }} />
            <p>Loading deliveries...</p>
          </div>
        ) : myRequests.length === 0 ? (
          <div className="dash-empty">
            <p>No deliveries yet. Create your first request!</p>
            <Link
              to="/create-request"
              className="dash-cta-btn"
              style={{ display: "inline-flex" }}
            >
              <Plus size={14} /> Create Request
            </Link>
          </div>
        ) : (
          <div className="dash-deliveries-list">
            {myRequests.slice(0, 4).map((req) => (
              <Link
                key={req.id}
                to={`/requests/${req.id}`}
                className="dash-delivery-item"
              >
                <div className="dash-delivery-icon">
                  <Package size={18} />
                </div>
                <div className="dash-delivery-info">
                  <div className="dash-delivery-title">
                    {req.pickup_description || "Package Delivery"}
                  </div>
                  <div className="dash-delivery-subtitle">
                    {req.hostel || "Campus"}, Room {req.room_number || "N/A"}
                  </div>
                </div>
                <div className="dash-delivery-amount">
                  ₹{req.reward_amount || 0}
                </div>
                <div className="dash-delivery-meta">
                  <div className={`dash-delivery-status ${getStatusClass(req.status)}`}>
                    {getStatusLabel(req.status)}
                  </div>
                  <div className="dash-delivery-time">
                    {new Date(req.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}

        {/* Refer & Earn */}
        <div className="dash-refer-card">
          <div className="dash-refer-content">
            <h3>Refer & Earn</h3>
            <p>Invite your friends and earn exciting rewards!</p>
          </div>
          <button className="dash-refer-btn">
            <Gift size={16} />
            Invite Now <ArrowRight size={14} />
          </button>
        </div>
      </main>
    </div>
  );
}
