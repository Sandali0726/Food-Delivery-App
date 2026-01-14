package com.restaurant_service.service;

import com.restaurant_service.Config.OtpGenerator;
import com.restaurant_service.model.Auth_User;
import com.restaurant_service.model.SignupOtp;
import com.restaurant_service.repository.Auth_Repository;
import com.restaurant_service.repository.SignupOtpRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final Auth_Repository authRepository;
    private final SignupOtpRepository signupOtpRepository;
    private final OtpGenerator otpGenerator;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 10;

    @Transactional
    public void sendSignupOtp(String email) {

        authRepository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        // Check existing OTP and rate-limit
        signupOtpRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .ifPresent(existing -> {
                    if (existing.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(2))) {
                        throw new IllegalStateException("Please wait before requesting another OTP");
                    }
                    existing.setUsed(true);
                    signupOtpRepository.save(existing);
                });

        String otp = otpGenerator.generateOtp();

        SignupOtp entity = SignupOtp.builder()
                .email(email)
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();

        signupOtpRepository.save(entity);
        // reuse email service but change subject by calling a new helper if needed
        emailService.sendOtp(email, otp, "Signup Verification OTP");
    }

    @Transactional
    public void verifySignupOtp(String email, String otp) {
        SignupOtp record = signupOtpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found"));

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("OTP expired");
        }

        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        Auth_User user = authRepository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setEnabled(true);
        user.setActive(true);
        authRepository.save(user);

        record.setUsed(true);
        signupOtpRepository.save(record);
    }

    @Transactional
    public void resendSignupOtp(String email) {
        // ensure user exists
        authRepository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        // Reuse sendSignupOtp logic - it already handles rate limiting and invalidation
        sendSignupOtp(email);
    }
}
