import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listMyRequests } from "../../services/requestService";
import RequestCard from "../../components/RequestCard/RequestCard";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      const data = await listMyRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div style={{
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "2rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            to="/dashboard"
            style={{
              color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: "4px"
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>
            My Parcel Requests
          </h2>
        </div>

        <button
          onClick={loadRequests}
          style={{
            background: "none", border: "none", color: "var(--text-secondary)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem"
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#ef4444",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "0.9rem"
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
          <p>Loading your requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          background: "rgba(15, 23, 42, 0.2)",
          border: "1px dashed var(--border-color)",
          borderRadius: "16px",
          padding: "4rem 2rem",
          textAlign: "center",
          color: "var(--text-secondary)"
        }}>
          <p style={{ margin: "0 0 1rem 0" }}>You haven't requested any deliveries yet.</p>
          <Link
            to="/create-request"
            style={{
              background: "var(--primary-color)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: "600",
              fontSize: "0.875rem",
              textDecoration: "none"
            }}
          >
            Create Request
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem"
        }}>
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
