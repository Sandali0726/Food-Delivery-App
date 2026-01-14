package com.example.riderservice.service;


import com.example.riderservice.exception.InvalidEmailException;
import com.example.riderservice.exception.InvalidOtpException;
import com.example.riderservice.model.auth;
import com.example.riderservice.repository.authRepository;
import com.example.riderservice.repository.passwordOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.riderservice.model.passwordOtp;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class resetPasswordService {

    private final passwordOtpRepository otpRepository;
    private final authRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Transactional(noRollbackFor = InvalidOtpException.class)
    public void resetPassword(String email, String otp, String newPassword) {

        passwordOtp savedOtp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (savedOtp.getTimestamp().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (savedOtp.getAttempts() >= 3) {
            throw new RuntimeException("Too many attempts");
        }


        if (!passwordEncoder.matches(otp, savedOtp.getOtp())) {
            System.out.println("Invalid OTP attempt for email: "+savedOtp);
            savedOtp.setAttempts(savedOtp.getAttempts() + 1);
            System.out.println("Incremented attempts to: "+savedOtp.getAttempts());
            otpRepository.save(savedOtp);
            throw new InvalidOtpException("Invalid OTP");
        }

        auth user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpRepository.deleteByEmail(email);
    }

}
