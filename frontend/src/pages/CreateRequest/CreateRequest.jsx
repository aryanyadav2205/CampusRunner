import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createPaymentOrder, openRazorpayCheckout } from "../../services/paymentService";
import { createRequest, uploadImage } from "../../services/requestService";
import { Package, MapPin, IndianRupee, HelpCircle, ArrowLeft, CheckCircle2, UploadCloud, X } from "lucide-react";
import "./CreateRequest.css";

export default function CreateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
  
  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      let uploadedImageUrl = null;
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        uploadedImageUrl = uploadRes.url;
      }

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
              tracking_number: trackingNum || null,
              tracking_image_url: uploadedImageUrl,
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
      <div className="success-screen">
        <div className="success-card">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CheckCircle2 size={72} className="success-icon" />
          </div>
          <div>
            <h3 className="success-title">
              Request Paid & Created!
            </h3>
            <p className="success-desc">
              Your delivery request is now OPEN. A runner will accept it shortly.
            </p>
          </div>

          <div className="otp-box">
            <span className="otp-label">
              Your 4-Digit Delivery OTP
            </span>
            <span className="otp-value">
              {createdOTP}
            </span>
            <p className="otp-hint">
              Provide this code to the runner when they deliver your parcel.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="submit-btn"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-request-container">
      <div className="create-request-header">
        <button
          onClick={() => navigate(-1)}
          className="back-button"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="create-request-title">
          Request a Delivery
        </h2>
      </div>

      <div className="create-request-card">
        <form onSubmit={handleSubmit} className="form-layout">
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Courier Company
              </label>
              <input
                type="text"
                placeholder="e.g. DTDC, Amazon, BlueDart"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Tracking Number (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter tracking ID"
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tracking Screenshot (Optional)</label>
            <div 
              className={`file-upload-area ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !imagePreview && fileInputRef.current && fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: "none" }} 
              />
              
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Tracking preview" className="image-preview" />
                  <button type="button" onClick={removeImage} className="remove-image-btn" aria-label="Remove image">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="file-upload-content">
                  <UploadCloud size={40} className="file-upload-icon" />
                  <span>Drag & Drop an image here, or <strong>click to browse</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Pickup Location Center
            </label>
            <input
              type="text"
              placeholder="e.g. Main Post Office Hub, North Gate Collection Center"
              value={pickupLoc}
              onChange={(e) => setPickupLoc(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Drop Hostel
              </label>
              <input
                type="text"
                placeholder="e.g. Raman Hostel"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Room Number
              </label>
              <input
                type="text"
                placeholder="e.g. A-101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Order Type
            </label>
            <div className="order-type-toggle">
              <button
                type="button"
                onClick={() => setOrderType("PREPAID")}
                className={`toggle-btn ${orderType === "PREPAID" ? "active-prepaid" : ""}`}
              >
                Prepaid Collection
              </button>
              
              <button
                type="button"
                onClick={() => setOrderType("COD")}
                className={`toggle-btn ${orderType === "COD" ? "active-cod" : ""}`}
              >
                Cash on Delivery (COD)
              </button>
            </div>
          </div>

          {orderType === "COD" && (
            <div className="form-group">
              <label className="form-label">
                COD Amount to Pay Center (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Enter COD amount in Rupees"
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
                className="form-input"
                required
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                The runner will pay this cash at the center and receive it back from you.
              </span>
            </div>
          )}

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="form-label">
                Reward Offered to Runner (₹)
              </label>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary-color)" }}>
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
              className="reward-slider"
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              <span>Min: ₹20</span>
              <span>Max: ₹100</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Parcel Notes (Optional)
            </label>
            <textarea
              placeholder="e.g. Fragile items, deliver after 5 PM, or specific gates info."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input form-textarea"
            />
          </div>

          <div className="calculations-block">
            <div className="calc-row">
              <span>Delivery Reward Payout:</span>
              <span className="calc-value">₹{reward}</span>
            </div>
            
            <div className="calc-row">
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span>Platform Service Fee:</span>
                <HelpCircle size={14} title="10% platform fee. Extra ₹10 processing fee for COD orders." style={{ cursor: "help" }} />
              </span>
              <span className="calc-value">₹{platformFee}</span>
            </div>

            {orderType === "COD" && (
              <div className="calc-row">
                <span>COD Parcel Price:</span>
                <span className="calc-value">₹{codAmount}</span>
              </div>
            )}

            <hr className="calc-divider" />

            <div className="calc-row calc-total">
              <span>Total Amount to Pay:</span>
              <span className="calc-total-value">
                <IndianRupee size={18} />
                <span>{totalAmount}</span>
              </span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Processing Payment..." : `Pay ₹${totalAmount} & Post`}
          </button>
        </form>
      </div>
    </div>
  );
}
