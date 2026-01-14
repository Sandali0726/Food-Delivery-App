package com.example.riderservice.service;


import com.example.riderservice.model.passwordOtp;
import com.example.riderservice.repository.passwordOtpRepository;
import com.example.riderservice.utility.otpGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class forgotPasswordService {

    private final passwordOtpRepository otpRepository;
    private final emailService emailService;
    private final PasswordEncoder passwordEncoder;


    public void sendOtp(String email) {

        String otp = otpGenerator.generateOtp();

        passwordOtp entity = otpRepository
                .findByEmail(email)
                .orElse(new passwordOtp());

        entity.setEmail(email);
        entity.setOtp(passwordEncoder.encode(otp));
        entity.setTimestamp(LocalDateTime.now().plusMinutes(5));
        entity.setAttempts(0);

        otpRepository.save(entity);

        emailService.sendOtpEmail(email, otp);

    }
}
