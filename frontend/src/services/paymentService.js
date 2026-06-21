import { apiCall } from "./api";

export async function createPaymentOrder(rewardOffered, orderType, codAmount = 0.0) {
  return apiCall("/payments/create-order", "POST", {
    reward_offered: rewardOffered,
    order_type: orderType,
    cod_amount: codAmount,
  });
}

/**
 * Loads Razorpay script dynamically and triggers checkout.
 * If order_id is mock, it uses a custom sandbox modal simulator.
 */
export function openRazorpayCheckout(orderData, userProfile, onSuccess, onFailure) {
  const isMock = orderData.razorpay_order_id.startsWith("order_mock_");

  if (isMock) {
    // Show simulated sandbox checkout overlay
    createMockCheckoutModal(orderData, onSuccess, onFailure);
    return;
  }

  // Real Razorpay Flow
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  script.onload = () => {
    const options = {
      key: "rzp_test_mockkeyid", // Loaded from backend configurations or hardcoded test keys
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Campus Runner",
      description: "Parcel Pick Up Payout",
      order_id: orderData.razorpay_order_id,
      handler: function (response) {
        onSuccess({
          razorpay_order_id: orderData.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: userProfile.full_name || "",
        contact: userProfile.phone_number || "",
      },
      theme: {
        color: "#6366f1",
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error("Payment window closed."));
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  script.onerror = () => {
    onFailure(new Error("Failed to load Razorpay library."));
  };
  document.body.appendChild(script);
}

// Sandbox Simulator modal injected to DOM for easy mock testing
function createMockCheckoutModal(orderData, onSuccess, onFailure) {
  const modalDiv = document.createElement("div");
  modalDiv.id = "mock-razorpay-modal";
  modalDiv.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  const amountRupees = (orderData.amount / 100).toFixed(2);

  modalDiv.innerHTML = `
    <div style="
      background: #1e293b;
      border: 1px solid #334155;
      padding: 2rem;
      border-radius: 16px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      color: #f8fafc;
      text-align: center;
    ">
      <div style="display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
        <span style="font-size:2rem; margin-right:0.5rem;">💳</span>
        <h3 style="margin:0; font-size:1.25rem; font-weight:600; color:#818cf8;">Razorpay Sandbox Simulator</h3>
      </div>
      <p style="color:#94a3b8; font-size:0.875rem; margin-bottom:1.5rem;">
        This request uses mock configurations. You are paying a simulated amount.
      </p>
      <div style="background:#0f172a; padding:1rem; border-radius:8px; margin-bottom:1.5rem;">
        <span style="font-size:0.75rem; text-transform:uppercase; color:#64748b; letter-spacing:0.05em; display:block;">Amount to Pay</span>
        <span style="font-size:1.75rem; font-weight:700; color:#38bdf8;">₹${amountRupees}</span>
      </div>
      <div style="display:flex; gap:10px; justify-content:center;">
        <button id="mock-pay-success" style="
          background: #6366f1; color: white; border: none;
          padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600;
          cursor: pointer; transition: background 0.2s;
        ">Simulate Success</button>
        <button id="mock-pay-fail" style="
          background: transparent; color: #94a3b8; border: 1px solid #334155;
          padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600;
          cursor: pointer;
        ">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalDiv);

  const cleanUp = () => {
    document.body.removeChild(modalDiv);
  };

  document.getElementById("mock-pay-success").onclick = () => {
    cleanUp();
    onSuccess({
      razorpay_order_id: orderData.razorpay_order_id,
      razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
      razorpay_signature: `sig_mock_${Math.random().toString(36).substring(2, 12)}`,
    });
  };

  document.getElementById("mock-pay-fail").onclick = () => {
    cleanUp();
    onFailure(new Error("Simulated payment cancelled."));
  };
}
