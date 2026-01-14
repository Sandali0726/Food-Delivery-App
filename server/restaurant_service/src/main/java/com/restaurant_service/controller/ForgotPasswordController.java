package com.restaurant_service.controller;

import com.restaurant_service.dto.ForgotPasswordRequest;
import com.restaurant_service.dto.ResetPasswordRequest;
import com.restaurant_service.service.ForgotPasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgot(@RequestBody ForgotPasswordRequest req) {
        forgotPasswordService.sendOtp(req.getEmail());
        return ResponseEntity.ok("OTP sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> reset(@RequestBody ResetPasswordRequest req) {
        forgotPasswordService.resetPassword(
                req.getEmail(),
                req.getOtp(),
                req.getNewPassword()
        );
        return ResponseEntity.ok("Password updated");
    }
}
