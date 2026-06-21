import { apiCall } from "./api";

export async function submitReview(requestId, rating, comment) {
  return apiCall("/reviews", "POST", {
    request_id: requestId,
    rating,
    comment,
  });
}
