import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getRequestDetails,
  cancelRequest,
  updateRequestStatus,
  verifyDeliveryOTP,
} from "../../services/requestService";
import { getMessages, sendMessage } from "../../services/messageService";
import { apiCall } from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import OTPModal from "../../components/OTPModal/OTPModal";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  IndianRupee,
  Calendar,
  HelpCircle,
  Star,
  Lock,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  const loadRequest = async () => {
    try {
      const data = await getRequestDetails(id);
      setRequest(data);

      // Load messages if it's accepted or beyond
      if (data.status !== "OPEN" && data.status !== "CANCELLED") {
        fetchMessages();
      }
    } catch (err) {
      setError(err.message || "Failed to load request details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const msgs = await getMessages(id);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  // Poll for messages
  useEffect(() => {
    let interval;
    if (
      request &&
      request.status !== "OPEN" &&
      request.status !== "CANCELLED"
    ) {
      interval = setInterval(fetchMessages, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [request]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatLoading(true);
    try {
      await sendMessage(id, chatInput);
      setChatInput("");
      fetchMessages();
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this request? You will be fully refunded.",
      )
    )
      return;
    try {
      await cancelRequest(id);
      alert("Request cancelled successfully.");
      loadRequest();
    } catch (err) {
      alert(err.message || "Failed to cancel request.");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateRequestStatus(id, newStatus);
      loadRequest();
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleOTPVerify = async (otpCode) => {
    await verifyDeliveryOTP(id, otpCode);
    setIsOTPModalOpen(false);
    loadRequest();
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "8rem 0",
          color: "var(--text-secondary)",
        }}
      >
        <p style={{ fontSize: "1.2rem" }}>Loading request details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "4rem auto",
          padding: "0 1rem",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#ef4444", marginBottom: "1rem" }}>
          <AlertCircle size={48} style={{ margin: "0 auto" }} />
        </div>
        <h3 style={{ color: "var(--text-primary)" }}>Failed to Load Request</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {error || "Request not found."}
        </p>
        <Link
          to="/dashboard"
          style={{ color: "var(--primary-color)", fontWeight: "600" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = request.owner_id === user.id;
  const isRunner = request.runner_id === user.id;

  // Timeline steps
  const timelineSteps = [
    { key: "OPEN", label: "Open" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "PICKED_UP", label: "Picked Up" },
    { key: "OUT_FOR_DELIVERY", label: "On the way" },
    { key: "OTP_VERIFICATION", label: "OTP Check" },
    { key: "COMPLETED", label: "Completed" },
  ];

  // Calculate current active step index
  const activeStepIndex = timelineSteps.findIndex(
    (step) => step.key === request.status,
  );

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {/* Back button */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "4px",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Request ID: #{request.id}
        </span>
      </div>

      {/* Main Details Card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                background: "rgba(99, 102, 241, 0.1)",
                padding: "10px",
                borderRadius: "10px",
                color: "var(--primary-color)",
              }}
            >
              <Package size={24} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.35rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                {request.courier_company}
              </h2>
              <span
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
              >
                Tracking Code: {request.tracking_number}
              </span>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Timeline (Hides on Cancelled) */}
        {request.status !== "CANCELLED" && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.3)",
              padding: "1.25rem 1rem",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              overflowX: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              minWidth: "100%",
            }}
            className="timeline-container"
          >
            {timelineSteps.map((step, idx) => {
              const completed = idx <= activeStepIndex;
              const current = idx === activeStepIndex;
              return (
                <div
                  key={step.key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    flex: 1,
                    minWidth: "70px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: completed
                        ? "var(--primary-color)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: current
                        ? "2px solid #38bdf8"
                        : completed
                          ? "none"
                          : "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: completed ? "white" : "var(--text-secondary)",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                    }}
                  >
                    {completed ? "✓" : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: current || completed ? "600" : "500",
                      color: current
                        ? "#38bdf8"
                        : completed
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Path Map */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
          className="details-grid"
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <MapPin
              size={18}
              style={{ color: "#38bdf8", flexShrink: 0, marginTop: "2px" }}
            />
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                }}
              >
                Pickup Location Hub
              </span>
              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}
              >
                {request.pickup_location}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <MapPin
              size={18}
              style={{ color: "#f43f5e", flexShrink: 0, marginTop: "2px" }}
            />
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                }}
              >
                Delivery Destination
              </span>
              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}
              >
                Hostel: {request.hostel} | Room: {request.room_number}
              </span>
            </div>
          </div>
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid var(--border-color)",
            margin: 0,
          }}
        />

        {/* Financial info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
          className="details-grid-3"
        >
          <div>
            <span
              style={{
                display: "block",
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
              }}
            >
              Order Type
            </span>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: "700",
                color: request.order_type === "COD" ? "#eab308" : "#38bdf8",
                textTransform: "uppercase",
              }}
            >
              {request.order_type}
            </span>
          </div>

          <div>
            <span
              style={{
                display: "block",
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
              }}
            >
              Runner Reward Payout
            </span>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#22c55e",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IndianRupee size={14} />
              {request.reward_offered}
            </span>
          </div>

          {request.order_type === "COD" && (
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                }}
              >
                COD Cash Collection
              </span>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "#eab308",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IndianRupee size={14} />
                {request.cod_amount}
              </span>
            </div>
          )}
        </div>

        {request.notes && (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              padding: "10px 14px",
              borderRadius: "8px",
              borderLeft: "3px solid var(--primary-color)",
              fontSize: "0.875rem",
            }}
          >
            <strong
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              Notes:
            </strong>
            <span style={{ color: "var(--text-primary)" }}>
              {request.notes}
            </span>
          </div>
        )}

        {/* Contact/Assignment cards */}
        {request.runner_id && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              background: "rgba(15, 23, 42, 0.4)",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
            }}
            className="form-grid"
          >
            {/* Owner Section */}
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                Parcel Owner
              </span>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <User size={16} />
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    {request.owner?.full_name || "N/A"}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      fontSize: "0.75rem",
                      color: "#eab308",
                    }}
                  >
                    <Star size={10} fill="#eab308" />
                    {request.owner?.rating_owner} Owner Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Runner Section */}
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  display: "block",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                Assigned Runner
              </span>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <User size={16} />
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    {request.runner?.full_name || "N/A"}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      fontSize: "0.75rem",
                      color: "#eab308",
                    }}
                  >
                    <Star size={10} fill="#eab308" />
                    {request.runner?.rating_runner} Runner Rating
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel (Actions based on status & role) */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "1.5rem 2rem",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          textAlign: "center",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Control Panel
        </h4>

        {/* 1. Cancel Option (Owner & Open status) */}
        {isOwner && request.status === "OPEN" && (
          <div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "12px",
              }}
            >
              No runner has accepted your delivery request yet. You can cancel
              it for a full refund.
            </p>
            <button
              onClick={handleCancel}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Cancel Request
            </button>
          </div>
        )}

        {/* 2. OTP Code Display (Owner & OTP Verification status) */}
        {isOwner && request.status === "OTP_VERIFICATION" && (
          <div
            style={{
              background: "rgba(168, 85, 247, 0.05)",
              border: "1px dashed rgba(168, 85, 247, 0.3)",
              padding: "1.25rem",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              Runner has arrived! Provide them this OTP code to complete
              delivery:
            </p>
            <span
              style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                color: "#a855f7",
                letterSpacing: "0.15em",
              }}
            >
              {request.otp_code || "XXXX"}
            </span>
          </div>
        )}

        {/* 3. Runner Progression buttons */}
        {isRunner && (
          <div>
            {request.status === "ACCEPTED" && (
              <div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                  }}
                >
                  Head to the parcel collection point. Once you have retrieved
                  the package, mark it as Picked Up.
                </p>
                <button
                  onClick={() => handleStatusUpdate("PICKED_UP")}
                  style={{
                    background: "#eab308",
                    color: "var(--bg-main)",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Mark as Picked Up
                </button>
              </div>
            )}

            {request.status === "PICKED_UP" && (
              <div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                  }}
                >
                  Package is in your possession. Mark it as Out for Delivery
                  when you start heading to the hostel.
                </p>
                <button
                  onClick={() => handleStatusUpdate("OUT_FOR_DELIVERY")}
                  style={{
                    background: "#f97316",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Mark Out for Delivery
                </button>
              </div>
            )}

            {request.status === "OUT_FOR_DELIVERY" && (
              <div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                  }}
                >
                  Arrived at the user's hostel? Request the 4-digit OTP code
                  from them.
                </p>
                <button
                  onClick={() => handleStatusUpdate("OTP_VERIFICATION")}
                  style={{
                    background: "#a855f7",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Arrived / Ask for OTP
                </button>
              </div>
            )}

            {request.status === "OTP_VERIFICATION" && (
              <div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                  }}
                >
                  Ask the parcel owner for the 4-digit OTP code and enter it to
                  finalize delivery.
                </p>
                <button
                  onClick={() => setIsOTPModalOpen(true)}
                  style={{
                    background: "var(--primary-color)",
                    color: "white",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  <Lock size={16} />
                  <span>Enter Verification OTP</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Parcel Chat Box */}
      {request.status !== "OPEN" &&
        request.status !== "CANCELLED" &&
        (isOwner || isRunner || user.is_admin) && (
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              height: "400px",
            }}
          >
            <div
              style={{
                background: "rgba(15, 23, 42, 0.5)",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <MessageSquare
                size={18}
                style={{ color: "var(--primary-color)" }}
              />
              <h4
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}
              >
                Parcel Communications
              </h4>
            </div>

            <div
              style={{
                flex: 1,
                padding: "1.5rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    margin: "auto",
                  }}
                >
                  No messages yet. Send a message to coordinate!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  const isAdmin = msg.sender_role === "admin";

                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: "75%",
                        background: isAdmin
                          ? "rgba(239, 68, 68, 0.1)"
                          : isMe
                            ? "var(--primary-color)"
                            : "var(--bg-elevated)",
                        color: isMe ? "white" : "var(--text-primary)",
                        border: isAdmin
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : isMe
                            ? "none"
                            : "1px solid var(--border-color)",
                        borderRadius: "16px",
                        borderBottomRightRadius: isMe ? "4px" : "16px",
                        borderBottomLeftRadius: isMe ? "16px" : "4px",
                        padding: "10px 14px",
                        boxShadow: isMe
                          ? "0 4px 14px rgba(34, 197, 94, 0.2)"
                          : "none",
                      }}
                    >
                      {!isMe && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.7rem",
                            color: isAdmin
                              ? "#ef4444"
                              : "var(--text-secondary)",
                            fontWeight: "600",
                            marginBottom: "4px",
                          }}
                        >
                          {msg.sender_name}{" "}
                          {isAdmin
                            ? "(Admin)"
                            : msg.sender_role === "runner"
                              ? "(Runner)"
                              : "(Owner)"}
                        </span>
                      )}
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          lineHeight: "1.4",
                        }}
                      >
                        {msg.text}
                      </p>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.65rem",
                          textAlign: "right",
                          marginTop: "4px",
                          opacity: 0.7,
                        }}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              style={{
                display: "flex",
                padding: "1rem",
                background: "var(--bg-elevated)",
                borderTop: "1px solid var(--border-color)",
                gap: "10px",
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  padding: "10px 14px",
                  borderRadius: "20px",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                }}
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                style={{
                  background: "var(--primary-color)",
                  color: "white",
                  border: "none",
                  padding: "0 20px",
                  borderRadius: "20px",
                  fontWeight: "600",
                  cursor: chatInput.trim() ? "pointer" : "not-allowed",
                  opacity: chatInput.trim() ? 1 : 0.5,
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}

      {/* Static description for others looking at it */}
      {!isOwner && !isRunner && request.status !== "OPEN" && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            margin: 0,
          }}
        >
          This request has already been claimed or completed.
        </p>
      )}
      {/* OTP verification Modal */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={handleOTPVerify}
        title="Delivery Verification"
        description="Ask the owner for their 4-digit code to complete the delivery."
      />
    </div>
  );
}
