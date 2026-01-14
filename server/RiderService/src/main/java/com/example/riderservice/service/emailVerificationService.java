package com.example.riderservice.service;

import com.example.riderservice.model.emailVerificationOtp;
import com.example.riderservice.repository.emailVerificationOtpRepository;
import com.example.riderservice.utility.otpGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class emailVerificationService {

    private final emailVerificationOtpRepository otpRepository;
    private final emailService emailService;
    private final PasswordEncoder passwordEncoder;

    public void sendVerificationOtp(String email) {
        String otp = otpGenerator.generateOtp();

        emailVerificationOtp entity = otpRepository
                .findByEmail(email)
                .orElse(new emailVerificationOtp());

        entity.setEmail(email);
        entity.setOtp(passwordEncoder.encode(otp));
        entity.setTimestamp(LocalDateTime.now().plusMinutes(10)); // 10 minutes validity
        entity.setAttempts(0);
        entity.setVerified(false);

        otpRepository.save(entity);

        emailService.sendEmailVerificationOtp(email, otp);
    }

    @Transactional
    public boolean verifyEmail(String email, String otp) {
        emailVerificationOtp savedOtp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found for this email"));

        if (savedOtp.getTimestamp().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (savedOtp.getAttempts() >= 3) {
            throw new RuntimeException("Too many failed attempts. Please request a new OTP.");
        }

        if (savedOtp.isVerified()) {
            throw new RuntimeException("Email is already verified.");
        }

        if (!passwordEncoder.matches(otp, savedOtp.getOtp())) {
            savedOtp.setAttempts(savedOtp.getAttempts() + 1);
            otpRepository.save(savedOtp);
            throw new RuntimeException("Invalid OTP. Remaining attempts: " + (3 - savedOtp.getAttempts()));
        }

        // Mark as verified
        savedOtp.setVerified(true);
        otpRepository.save(savedOtp);

        return true;
    }

    public boolean isEmailVerified(String email) {
        return otpRepository.existsByEmailAndVerifiedTrue(email);
    }

    @Transactional
    public void resendVerificationOtp(String email) {
        // Delete existing OTP entry to reset attempts
        otpRepository.deleteByEmail(email);

        // Send new OTP
        sendVerificationOtp(email);
    }
}
