import api from "../api/axios";

export const login = (data) =>
  api.post("/auth/login", data);

export const register = (formData) =>
  api.post("/auth/register", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  
export const getCurrentRider = () =>
  api.get("/auth/me");

export const logout = () =>
  api.post("/auth/logout");

export const refreshToken = () =>
  api.post("/auth/refresh");


export const forgetPassword = (email) =>
  api.post(`/forgot-password?email=${email}`);

export const resetPassword = (email, otp, newPassword) =>
  api.post(`/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`);


export const changePassword = (email, oldPassword, newPassword) =>
  api.post(`/change-password?email=${email}&oldPassword=${oldPassword}&newPassword=${newPassword}`);
