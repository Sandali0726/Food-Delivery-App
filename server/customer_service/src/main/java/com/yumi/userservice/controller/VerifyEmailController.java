package com.yumi.userservice.controller;

import com.yumi.userservice.service.VerifyEmail;
import com.yumi.userservice.model.OTP;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers/email")
@CrossOrigin(origins = "http://localhost:3000")
public class VerifyEmailController {
    @Autowired
    private  VerifyEmail verifyEmail;

    // ================= SEND OTP =================
    @PutMapping("/verify-code")
    public ResponseEntity<String> sendOtp(
            @RequestParam String email,
            @RequestParam(required = false) String code,
            @RequestParam OTP.Purpose purpose
    ) {
        // Only send OTP if code is missing or blank
        if (code == null || code.isBlank()) {
            verifyEmail.sendVerificationOtp(email);
            return ResponseEntity.ok("Verification code sent.");
        }
        return ResponseEntity.badRequest().body("Code already provided, use POST to verify.");
    }

    // ================= VERIFY OTP =================
    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyOtp(
            @RequestParam String email,
            @RequestParam String code,
            @RequestParam OTP.Purpose purpose
    ) {
        boolean valid = verifyEmail.verifyEmailOtp(email, code);
        if (valid) {
            return ResponseEntity.ok("Code verified successfully.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired code.");
        }
    }
}
