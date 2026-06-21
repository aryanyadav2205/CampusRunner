import { apiCall } from "./api";

export async function sendOTP(email, phoneNumber) {
  return apiCall("/auth/otp/send", "POST", {
    email: email,
    phone_number: phoneNumber,
  });
}

export async function verifyOTP(email, otpCode) {
  return apiCall("/auth/otp/verify", "POST", {
    email: email,
    otp_code: otpCode,
  });
}
