import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createPaymentOrder, openRazorpayCheckout } from "../../services/paymentService";
import { createRequest } from "../../services/requestService";
import { Package, MapPin, IndianRupee, HelpCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function CreateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [courier, setCourier] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const [pickupLoc, setPickupLoc] = useState("");
  const [hostel, setHostel] = useState(user?.hostel || "");
  const [roomNumber, setRoomNumber] = useState(user?.room_number || "");
  const [orderType, setOrderType] = useState("PREPAID"); // PREPAID or COD
  const [codAmount, setCodAmount] = useState(0.0);
  const [reward, setReward] = useState(30.0);
  const [notes, setNotes] = useState("");

  // Calculation states
  const [platformFee, setPlatformFee] = useState(3.0);
  const [totalAmount, setTotalAmount] = useState(33.0);

  // Flow states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdOTP, setCreatedOTP] = useState("");

  // recalculate fees on change
  useEffect(() => {
    const rewardVal = parseFloat(reward) || 0.0;
    const codVal = orderType === "COD" ? parseFloat(codAmount) || 0.0 : 0.0;
    
    // Platform fee: 10% of reward
    let fee = rewardVal * 0.10;
    if (orderType === "COD") {
      fee += 10.0; // ₹10 extra for COD processing
    }

    const calculatedFee = Math.round(fee * 100) / 100;
    const total = Math.round((rewardVal + calculatedFee + codVal) * 100) / 100;

    setPlatformFee(calculatedFee);
    setTotalAmount(total);
  }, [reward, orderType, codAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (reward < 20 || reward > 100) {
      setError("Reward must be between ₹20 and ₹100.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create Razorpay Order on Server
      const orderData = await createPaymentOrder(reward, orderType, codAmount);

      // Step 2: Open Razorpay Sandbox/Real checkout
      openRazorpayCheckout(
        orderData,
        user,
        async (paymentResponse) => {
          // Success Callback: Step 3: Create delivery request in DB
          try {
            const requestResult = await createRequest({
              courier_company: courier,
              tracking_number: trackingNum,
              pickup_location: pickupLoc,
              hostel: hostel,
              room_number: roomNumber,
              order_type: orderType,
              cod_amount: orderType === "COD" ? parseFloat(codAmount) : 0,
              reward_offered: parseFloat(reward),
              notes: notes || null,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            // Display plain OTP code generated for Owner
            setCreatedOTP(requestResult.otp_code);
          } catch (createErr) {
            setError(createErr.message || "Failed to finalize delivery request creation.");
            setLoading(false);
          }
        },
        (paymentErr) => {
          setError(paymentErr.message || "Payment authorization failed.");
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err.message || "Failed to initiate transaction.");
      setLoading(false);
    }
  };

  if (createdOTP) {
    return (
      <div style={{
        maxWidth: "480px",
        margin: "4rem auto",
        padding: "0 1rem"
      }}>
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}>
          <div style={{ display: "flex", justifyContent: "center", color: "#22c55e" }}>
            <CheckCircle2 size={56} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
              Request Paid & Created!
            </h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Your delivery request is now OPEN. A runner will accept it shortly.
            </p>
          </div>

          <div style={{
            background: "rgba(15, 23, 42, 0.5)",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid var(--border-color)"
          }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
              Your 4-Digit Delivery OTP
            </span>
            <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary-color)", letterSpacing: "0.1em" }}>
              {createdOTP}
            </span>
            <p style={{ margin: "10px 0 0 0", fontSize: "0.75rem", color: "#a855f7" }}>
              Provide this code to the runner when they deliver your parcel.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "var(--primary-color)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "640px",
      margin: "0 auto",
      padding: "2rem 1rem"
    }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "1.5rem" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none", border: "none",
            color: "var(--text-secondary)", cursor: "pointer",
            display: "flex", alignItems: "center", padding: "4px"
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>
          Request a Delivery
        </h2>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "20px",
        padding: "2rem",
        boxShadow: "0 10px 35px rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)"
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Grid fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Courier Company
              </label>
              <input
                type="text"
                placeholder="e.g. DTDC, Amazon, BlueDart"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                style={{
                  padding: "10px 12px",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Tracking Number
              </label>
              <input
                type="text"
                placeholder="Enter tracking ID"
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
                style={{
                  padding: "10px 12px",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
              Pickup Location Center
            </label>
            <input
              type="text"
              placeholder="e.g. Main Post Office Hub, North Gate Collection Center"
              value={pickupLoc}
              onChange={(e) => setPickupLoc(e.target.value)}
              style={{
                padding: "10px 12px",
                background: "rgba(15, 23, 42, 0.4)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                outline: "none"
              }}
              required
            />
          </div>

          {/* Delivery Location Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Drop Hostel
              </label>
              <input
                type="text"
                placeholder="e.g. Raman Hostel"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                style={{
                  padding: "10px 12px",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Room Number
              </label>
              <input
                type="text"
                placeholder="e.g. A-101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                style={{
                  padding: "10px 12px",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
                required
              />
            </div>
          </div>

          {/* Order Type Toggle */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
              Order Type
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setOrderType("PREPAID")}
                style={{
                  flex: 1,
                  background: orderType === "PREPAID" ? "rgba(56, 189, 248, 0.1)" : "rgba(15, 23, 42, 0.2)",
                  border: orderType === "PREPAID" ? "1px solid #38bdf8" : "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "10px",
                  color: orderType === "PREPAID" ? "#38bdf8" : "var(--text-secondary)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Prepaid Collection
              </button>
              
              <button
                type="button"
                onClick={() => setOrderType("COD")}
                style={{
                  flex: 1,
                  background: orderType === "COD" ? "rgba(234, 179, 8, 0.1)" : "rgba(15, 23, 42, 0.2)",
                  border: orderType === "COD" ? "1px solid #eab308" : "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "10px",
                  color: orderType === "COD" ? "#eab308" : "var(--text-secondary)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Cash on Delivery (COD)
              </button>
            </div>
          </div>

          {orderType === "COD" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                COD Amount to Pay Center (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Enter COD amount in Rupees"
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
                style={{
                  padding: "10px 12px",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                The runner will pay this cash at the center and receive it back from you.
              </span>
            </div>
          )}

          {/* Reward Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Reward Offered to Runner (₹)
              </label>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#22c55e" }}>
                ₹{reward}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              style={{
                width: "100%",
                accentColor: "var(--primary-color)",
                cursor: "pointer"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
              <span>Min: ₹20</span>
              <span>Max: ₹100</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
              Parcel Notes (Optional)
            </label>
            <textarea
              placeholder="e.g. Fragile items, deliver after 5 PM, or specific gates info."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{
                padding: "10px 12px",
                background: "rgba(15, 23, 42, 0.4)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                resize: "none",
                outline: "none"
              }}
            />
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "0.5rem 0" }} />

          {/* Calculations Review Block */}
          <div style={{
            background: "rgba(15, 23, 42, 0.5)",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Delivery Reward Payout:</span>
              <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>₹{reward}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>Platform Service Fee:</span>
                <HelpCircle size={12} title="10% platform fee. Extra ₹10 processing fee for COD orders." style={{ cursor: "help" }} />
              </span>
              <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>₹{platformFee}</span>
            </div>

            {orderType === "COD" && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>COD Parcel Price:</span>
                <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>₹{codAmount}</span>
              </div>
            )}

            <hr style={{ border: 0, borderTop: "1px dashed var(--border-color)", margin: "4px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "700" }}>
              <span style={{ color: "var(--text-primary)" }}>Total Amount to Pay:</span>
              <span style={{ color: "#22c55e", display: "flex", alignItems: "center" }}>
                <IndianRupee size={14} />
                <span>{totalAmount}</span>
              </span>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#ef4444",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "0.9rem",
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
              padding: "12px",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            className="btn-hover"
          >
            {loading ? "Processing Payment..." : `Pay ₹${totalAmount} & Post`}
          </button>
        </form>
      </div>
    </div>
  );
}
