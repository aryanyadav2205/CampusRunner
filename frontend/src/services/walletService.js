import { apiCall } from "./api";

export async function getWalletBalance() {
  return apiCall("/wallet/balance", "GET");
}

export async function requestWithdrawal(amount, upiId) {
  return apiCall("/wallet/withdraw", "POST", { amount, upi_id: upiId });
}
