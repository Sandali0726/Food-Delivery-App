package com.yumi.userservice.controller;

import com.yumi.userservice.dto.Authdto.JwtResponse;
import com.yumi.userservice.dto.Authdto.LoginRequestDto;
import com.yumi.userservice.dto.Authdto.SignupRequest;
import com.yumi.userservice.model.OTP;
import com.yumi.userservice.service.AuthService;
import com.yumi.userservice.service.PasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordService passwordService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req){
        try {
            authService.signup(req);
            return ResponseEntity.ok().body(new JwtResponse("Registration successful", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new JwtResponse(e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto req,  HttpServletResponse response){
        try {
            String token = authService.login(req.getAuth_email(), req.getPassword());

            // Set as HTTP-only cookie for server-side protected routes
            Cookie cookie = new Cookie("jwt_token", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(24 * 60 * 60); // 1 day
            response.addCookie(cookie);

            // Also return token in body so SPA can store and use it for Authorization header
            return ResponseEntity.ok(new JwtResponse("Login successful", token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new JwtResponse(e.getMessage(), null));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        try{
            passwordService.sendResetOtp(email, OTP.Purpose.RESET_PASSWORD);
            return ResponseEntity.ok("If the email exists, a reset code has been sent.");
        }
        catch(Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @RequestMapping(value = "/verify-code", method = { RequestMethod.POST, RequestMethod.PUT })
    public ResponseEntity<String> verifyOrSendCode(@RequestParam String email,
                                                   @RequestParam(required = false) String code,
                                                   @RequestParam OTP.Purpose purpose) {
        // If no code provided or blank, treat as send-OTP action
        if (code == null || code.isBlank()) {
            passwordService.sendOtp(email, purpose);
            return ResponseEntity.ok("Code sent");
        }

        boolean valid = passwordService.verifyResetOtp(email, code, purpose);
        return valid
                ? ResponseEntity.ok("Code verified")
                : ResponseEntity.badRequest().body("Invalid or expired code");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String email,
                                                @RequestParam String newPassword) {
        passwordService.resetPassword(email, newPassword);
        return ResponseEntity.ok("Password reset successful");
    }
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestParam String email,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {

        if (email.isBlank() || oldPassword.isBlank() || newPassword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Email, old password, and new password must not be empty");
        }

        passwordService.changePassword(email, oldPassword, newPassword);
        return ResponseEntity.ok("Password change successful");
    }
}
