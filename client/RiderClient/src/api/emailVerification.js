import api from "./axios";

// Send email verification OTP
export const sendEmailOtp = (email) => 
    api.post('/auth/send-email-otp', null, {
        params: { email }
    });

// Verify email OTP
export const verifyEmailOtp = (email, otp) =>
    api.post('/auth/verify-email-otp', {
        email,
        otp
    });

// Resend email verification OTP
export const resendEmailOtp = (email) =>
    api.post('/auth/resend-email-otp', null, {
        params: { email }
    });