import api from "./axios";
import { refreshSession } from "./axios";

export const loginRestaurant = (data) =>
  api.post("/api/auth/login", data);

export const registerRestaurant = (data) =>
  api.post("/api/auth/register", data);

export const logoutRestaurant = () =>
  api.post("/api/auth/logout");

export const changePassword = (data) =>
  api.post("/api/auth/change-password", data);

export const requestPasswordReset = (email) =>
  api.post("/api/auth/forgot-password", { email });

export const resetPasswordWithOtp = (data) =>
  api.post("/api/auth/reset-password", data);

export const checkAuth = () =>
  api.get("/api/auth/check");

export const verifyOtp = (data) =>
  api.post("/api/auth/verify-otp", data);

export const resendOtp = (data) =>
  api.post("/api/auth/resend-otp", data);

export { refreshSession };