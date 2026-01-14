package com.yumi.userservice.service;

import com.yumi.userservice.model.OTP;
import com.yumi.userservice.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Random;

@Service
public class VerifyEmail {
        @Autowired
        private TokenRepository tokenRepository;

        @Autowired
        private EmailService emailService;

        // Send OTP after signup
        public void sendVerificationOtp(String email) {
            String code = String.valueOf(new Random().nextInt(900000) + 100000);
            Date expiry = new Date(System.currentTimeMillis() + 1000 * 60 * 1000);

            OTP otp = tokenRepository.findByEmailAndPurpose(email, OTP.Purpose.VERIFY_EMAIL)
                    .orElse(new OTP());

            otp.setEmail(email);
            otp.setOtp(code);
            otp.setExpiryDate(expiry);
            otp.setPurpose(OTP.Purpose.VERIFY_EMAIL);

            tokenRepository.save(otp);

            emailService.sendEmail(
                    email,
                    "Email Verification Code",
                    "Your email verification code is: " + code
            );
        }

        // Verify email OTP
        public boolean verifyEmailOtp(String email, String code) {
            return tokenRepository.findByEmailAndPurpose(email, OTP.Purpose.VERIFY_EMAIL)
                    .map(otp -> otp.getOtp().equals(code) && otp.getExpiryDate().after(new Date()))
                    .orElse(false);
        }
    }