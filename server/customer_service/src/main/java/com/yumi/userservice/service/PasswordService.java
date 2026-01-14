package com.yumi.userservice.service;

import com.yumi.userservice.model.Auth;
import com.yumi.userservice.model.OTP;
import com.yumi.userservice.repository.AuthRepository;
import com.yumi.userservice.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.Random;

@Service
public class PasswordService {

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    // Generic send OTP for any purpose
    public void sendOtp(String email, OTP.Purpose purpose) {
        // Ensure user exists for reset, allow any email for verify to avoid leaking user existence
        if (purpose == OTP.Purpose.RESET_PASSWORD) {
            authRepository.findById(email).orElseThrow(() -> new RuntimeException("User not found"));
        }
        String code = String.valueOf(random.nextInt(900000) + 100000);
        Date expiry = new Date(System.currentTimeMillis() + 100000 * 60 * 1000L);
        OTP otp = tokenRepository.findByEmailAndPurpose(email, purpose).orElse(new OTP());
        otp.setEmail(email);
        otp.setOtp(code);
        otp.setExpiryDate(expiry);
        otp.setPurpose(purpose);
        tokenRepository.save(otp);

        String subject = purpose == OTP.Purpose.RESET_PASSWORD ? "Password Reset Code" : "Email Verification Code";
        String body = (purpose == OTP.Purpose.RESET_PASSWORD ? "Your password reset code is: " : "Your email verification code is: ") + code;
        emailService.sendEmail(email, subject, body);
    }

    // Overload to match controller usage
    public void sendResetOtp(String email, OTP.Purpose purpose) {
        sendOtp(email, purpose);
    }

    // Generic verify OTP for any purpose
    public boolean verifyOtp(String email, String code, OTP.Purpose purpose) {
        return tokenRepository.findByEmailAndPurpose(email, purpose)
                .map(otp -> otp.getOtp().equals(code) && otp.getExpiryDate().after(new Date()))
                .orElse(false);
    }

    // Overload to match controller usage
    public boolean verifyResetOtp(String email, String code, OTP.Purpose purpose) {
        return verifyOtp(email, code, purpose);
    }

    @Transactional
    public void resetPassword(String email, String newPassword) {
        Auth authUser = authRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        OTP otp = tokenRepository.findByEmailAndPurpose(email, OTP.Purpose.RESET_PASSWORD)
                .orElseThrow(() -> new RuntimeException("Invalid or expired code"));

        authUser.setPassword(passwordEncoder.encode(newPassword));
        authRepository.save(authUser);
        tokenRepository.delete(otp);
    }
    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword){
        Auth authUser = authRepository.findById(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if(!passwordEncoder.matches(oldPassword, authUser.getPassword())){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        authUser.setPassword(passwordEncoder.encode(newPassword));
        authRepository.save(authUser);
    }
}
