import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listMyRequests, listMyRuns } from "../../services/requestService";
import { ArrowLeft, CreditCard, ArrowUpRight, ArrowDownLeft, IndianRupee } from "lucide-react";

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ earned: 0, spent: 0, pending: 0 });

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const [owned, runs] = await Promise.all([listMyRequests(), listMyRuns()]);
        
        let earned = 0;
        let spent = 0;
        let pending = 0;
        const list = [];

        // Map owned requests (money spent)
        owned.forEach((req) => {
          // If cancelled, it's refunded, else it's spent/held
          const isRefunded = req.status === "CANCELLED";
          const amount = req.total_amount;
          
          if (!isRefunded) {
            spent += amount;
          }

          list.push({
            id: `tx-owner-${req.id}`,
            date: req.created_at,
            type: "payment",
            description: `Delivery request for ${req.courier_company}`,
            amount: amount,
            status: isRefunded ? "REFUNDED" : "PAID",
            rawStatus: req.status
          });
        });

        // Map runs requests (money earned)
        runs.forEach((run) => {
          const reward = run.reward_offered;
          
          if (run.status === "COMPLETED") {
            earned += reward;
          } else if (run.status !== "CANCELLED") {
            pending += reward;
          }

          list.push({
            id: `tx-runner-${run.id}`,
            date: run.created_at,
            type: "earning",
            description: `Retrieved parcel for ${run.owner?.full_name || "Student"}`,
            amount: reward,
            status: run.status === "COMPLETED" ? "SETTLED" : run.status === "CANCELLED" ? "CANCELLED" : "PENDING",
            rawStatus: run.status
          });
        });

        // Sort by date desc
        list.sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(list);
        setStats({ earned, spent, pending });
      } catch (err) {
        console.error("Failed to load financial transaction summary:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  return (
    <div style={{
      maxWidth: "900px",
      margin: "0 auto",
      padding: "2rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem"
    }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Link to="/dashboard" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: "4px" }}>
          <ArrowLeft size={20} />
        </Link>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>
          Payments & Ledger
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
          <p>Analyzing financials...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem"
          }} className="details-grid-3">
            {/* Earnings */}
            <div style={{
              background: "rgba(34, 197, 94, 0.05)",
              border: "1px solid rgba(34, 197, 94, 0.15)",
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "10px", borderRadius: "10px" }}>
                <ArrowUpRight size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block" }}>
                  Total Earned
                </span>
                <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#22c55e", display: "flex", alignItems: "center" }}>
                  <IndianRupee size={18} />
                  {stats.earned.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Spent */}
            <div style={{
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "10px", borderRadius: "10px" }}>
                <ArrowDownLeft size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block" }}>
                  Total Spent
                </span>
                <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ef4444", display: "flex", alignItems: "center" }}>
                  <IndianRupee size={18} />
                  {stats.spent.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pending Payout */}
            <div style={{
              background: "rgba(234, 179, 8, 0.05)",
              border: "1px solid rgba(234, 179, 8, 0.15)",
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{ background: "rgba(234, 179, 8, 0.1)", color: "#eab308", padding: "10px", borderRadius: "10px" }}>
                <CreditCard size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block" }}>
                  Pending Payout
                </span>
                <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#eab308", display: "flex", alignItems: "center" }}>
                  <IndianRupee size={18} />
                  {stats.pending.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
              Transaction Log
            </h3>
            
            {transactions.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", margin: 0, textAlign: "center", padding: "2rem" }}>
                No transaction history found.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {transactions.map((tx) => {
                  const isEarning = tx.type === "earning";
                  return (
                    <div
                      key={tx.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.02)",
                        borderRadius: "10px",
                        fontSize: "0.9rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          background: isEarning ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: isEarning ? "#22c55e" : "#ef4444",
                          padding: "6px",
                          borderRadius: "6px"
                        }}>
                          {isEarning ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>
                        <div>
                          <span style={{ display: "block", fontWeight: "600", color: "var(--text-primary)" }}>
                            {tx.description}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {new Date(tx.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span style={{
                          display: "block",
                          fontWeight: "700",
                          color: isEarning ? "#22c55e" : "#ef4444",
                          fontSize: "1rem"
                        }}>
                          {isEarning ? "+" : "-"} ₹{tx.amount.toFixed(2)}
                        </span>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: "600",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: tx.status === "REFUNDED" ? "rgba(239,68,68,0.15)" : tx.status === "PENDING" ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.05)",
                          color: tx.status === "REFUNDED" ? "#ef4444" : tx.status === "PENDING" ? "#eab308" : "var(--text-secondary)",
                          textTransform: "uppercase"
                        }}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
