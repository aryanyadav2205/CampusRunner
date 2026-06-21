import { apiCall } from "./api";

export async function createRequest(requestData) {
  return apiCall("/requests", "POST", requestData);
}

export async function listOpenRequests() {
  return apiCall("/requests", "GET");
}

export async function listMyRequests() {
  return apiCall("/requests/my", "GET");
}

export async function listMyRuns() {
  return apiCall("/requests/runs", "GET");
}

export async function getRequestDetails(id) {
  return apiCall(`/requests/${id}`, "GET");
}

export async function acceptRequest(id) {
  return apiCall(`/requests/${id}/accept`, "POST");
}

export async function updateRequestStatus(id, newStatus) {
  return apiCall(`/requests/${id}/status`, "PUT", { status: newStatus });
}

export async function verifyDeliveryOTP(id, otpCode) {
  return apiCall(`/requests/${id}/verify`, "POST", { otp_code: otpCode });
}

export async function cancelRequest(id) {
  return apiCall(`/requests/${id}/cancel`, "POST");
}
