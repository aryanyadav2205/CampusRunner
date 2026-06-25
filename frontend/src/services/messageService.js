import { apiCall } from "./api";

export async function getConversations() {
  return apiCall("/messages/conversations", "GET");
}

export async function getMessages(requestId) {
  return apiCall(`/requests/${requestId}/messages`, "GET");
}

export async function sendMessage(requestId, text) {
  return apiCall(`/requests/${requestId}/messages`, "POST", { text });
}
