package com.restaurant_service.service;

import com.restaurant_service.Config.OtpGenerator;
import com.restaurant_service.model.Auth_User;
import com.restaurant_service.model.PasswordResetOtp;
import com.restaurant_service.repository.Auth_Repository;
import com.restaurant_service.repository.PasswordResetOtpRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final Auth_Repository authRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final OtpGenerator otpGenerator;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public void sendOtp(String email) {

        authRepository.findById(email)
                .orElseThrow(() -> new IllegalArgumentException("Email not found"));

        // Check existing OTP
        otpRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .ifPresent(existing -> {

                    // Rate limit: 2 minutes
                    if (existing.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(2))) {
                        throw new IllegalStateException(
                                "Please wait before requesting another OTP"
                        );
                    }

                    // Invalidate old OTP
                    existing.setUsed(true);
                    otpRepository.save(existing);
                });

        String otp = otpGenerator.generateOtp();

        PasswordResetOtp entity = PasswordResetOtp.builder()
                .email(email)
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();

        otpRepository.save(entity);
        emailService.sendOtp(email, otp);
    }


    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {

        PasswordResetOtp record = otpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found"));

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("OTP expired");
        }

        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        Auth_User user = authRepository.findById(email)
                .orElseThrow();

        user.setPassword(passwordEncoder.encode(newPassword));
        authRepository.save(user);

        record.setUsed(true);
        otpRepository.save(record);
    }
}
