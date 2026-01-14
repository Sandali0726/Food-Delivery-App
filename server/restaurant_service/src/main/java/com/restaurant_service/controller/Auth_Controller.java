package com.restaurant_service.controller;
import com.restaurant_service.dto.Auth_Dto;
import com.restaurant_service.dto.ChangePassword_Dto;
import com.restaurant_service.dto.ResendOtp_Dto;
import com.restaurant_service.dto.VerifyOtp_Dto;
import com.restaurant_service.service.Auth_Service;
import com.restaurant_service.service.VerificationService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class Auth_Controller {

    private final Auth_Service auth_Service;
    private final VerificationService verificationService;

    public Auth_Controller(Auth_Service auth_Service, VerificationService verificationService) {
        this.auth_Service = auth_Service;
        this.verificationService = verificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Auth_Dto auth_Dto) {
        auth_Service.create_auth_user(auth_Dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered. Verification OTP sent to email.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Auth_Dto auth_Dto, HttpServletResponse response) {
        return auth_Service.loginUser(auth_Dto, response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = "REFRESH_TOKEN", required = false) String refreshToken,
            HttpServletResponse response) {
        return auth_Service.refresh(refreshToken, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(value = "REFRESH_TOKEN", required = false) String refreshToken,
            HttpServletResponse response) {
        return auth_Service.logout(refreshToken, response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePassword_Dto dto) {
        auth_Service.changePassword(dto);
        return ResponseEntity.ok("Password changed successfully");

    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(Authentication authentication) {
        if (authentication == null ||
                authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtp_Dto dto) {
        verificationService.verifySignupOtp(dto.getEmail(), dto.getOtp());
        return ResponseEntity.ok("Email verified successfully");
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestBody ResendOtp_Dto dto) {
        verificationService.resendSignupOtp(dto.getEmail());
        return ResponseEntity.ok("OTP resent");
    }
}