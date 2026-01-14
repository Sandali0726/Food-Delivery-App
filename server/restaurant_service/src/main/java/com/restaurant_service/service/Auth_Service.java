package com.restaurant_service.service;
import com.restaurant_service.dto.Auth_Dto;
import com.restaurant_service.dto.ChangePassword_Dto;
import com.restaurant_service.mapper.Auth_Mapper;
import com.restaurant_service.model.Auth_User;
import com.restaurant_service.repository.Auth_Repository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

// added imports
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import com.restaurant_service.security_config.JwtConfig;
import com.restaurant_service.enums.Role;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class Auth_Service {

    private final Auth_Repository auth_repository;
    private final PasswordEncoder passwordEncoder;
    private final Auth_Mapper auth_Mapper;

    // new dependencies used for login logic
    private final AuthenticationManager authManager;
    private final JwtConfig jwtConfig;
    private final RefreshTokenService refreshTokenService;
    private final VerificationService verificationService;

    public Auth_Service(Auth_Repository auth_repository, PasswordEncoder passwordEncoder, Auth_Mapper auth_Mapper,
                        AuthenticationManager authManager, JwtConfig jwtConfig, RefreshTokenService refreshTokenService, VerificationService verificationService) {
        this.auth_Mapper = auth_Mapper;
        this.passwordEncoder = passwordEncoder;
        this.auth_repository = auth_repository;
        this.authManager = authManager;
        this.jwtConfig = jwtConfig;
        this.refreshTokenService = refreshTokenService;
        this.verificationService = verificationService;
    }

    public Optional<Auth_User> create_auth_user(Auth_Dto dto) {
        try {
            if (dto.getEmail() != null && dto.getPassword() != null && !auth_repository.existsByEmail(dto.getEmail())) {
                Auth_User user = auth_Mapper.toEntity(dto);
                String encodedPassword = passwordEncoder.encode(dto.getPassword());
                user.setPassword(encodedPassword);
                // mark new user as NOT active/enabled until they verify via OTP
                user.setActive(false);
                user.setEnabled(false);
                auth_repository.save(user);
                // attempt to send verification OTP to user's email. If mailing fails, log and continue
                try {
                    verificationService.sendSignupOtp(dto.getEmail());
                } catch (Exception ex) {
                    // Don't fail user registration because email sending failed (mail server/config issue)
                    // Log the error and allow the client to retry verification via /resend-otp
                    System.err.println("Failed to send signup OTP to " + dto.getEmail() + ": " + ex.getMessage());
                }
                return Optional.of(user);
            } else if (auth_repository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            } else {
                throw new IllegalArgumentException("Email and Password must not be null");
            }
        }catch (Exception e) {
            throw new RuntimeException("Failed to create auth user: " + e.getMessage(), e);
        }
    }

    // moved business logic for /login into service
    public ResponseEntity<?> loginUser(Auth_Dto auth_Dto, HttpServletResponse response) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            auth_Dto.getEmail(), auth_Dto.getPassword()));

            // set authentication into security context for remainder of request
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (AuthenticationException ex) {
            // explicit 401 for bad credentials
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        String accessToken = jwtConfig.generateAccessToken(auth_Dto.getEmail(), Role.RESTUARANT.name());
        String refreshToken = jwtConfig.generateRefreshToken(auth_Dto.getEmail(), Role.RESTUARANT.name());

        refreshTokenService.save(
                refreshToken,
                auth_Dto.getEmail(),
                LocalDateTime.now().plusDays(2)
        );

        // reuse existing helper to set cookies
        setCookies(response, accessToken, refreshToken);

        return ResponseEntity.ok("Login success");
    }

    // new: moved business logic for /refresh into service
    public ResponseEntity<?> refresh(String refreshToken, HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing refresh token");
        }

        try {
            String email = jwtConfig.extractUsername(refreshToken);
            var stored = refreshTokenService.validate(refreshToken, email);

            refreshTokenService.revoke(stored);

            String newAccess = jwtConfig.generateAccessToken(email, Role.RESTUARANT.name());
            String newRefresh = jwtConfig.generateRefreshToken(email, Role.RESTUARANT.name());

            refreshTokenService.save(
                    newRefresh,
                    email,
                    LocalDateTime.now().plusDays(2)
            );

            // set cookies using existing helper
            setCookies(response, newAccess, newRefresh);

            return ResponseEntity.ok("Token refreshed");
        } catch (Exception ex) {
            refreshTokenService.clearIfTampered(refreshToken);
            clearCookies(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
    }

    // new: moved business logic for /logout into service
    public ResponseEntity<?> logout(String refreshToken, HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            clearCookies(response);
            return ResponseEntity.ok("Logged out");
        }

        String email = jwtConfig.extractUsername(refreshToken);
        refreshTokenService.revokeAll(email);
        clearCookies(response);
        return ResponseEntity.ok("Logged out");
    }

    private void setCookies(HttpServletResponse response,
                            String access, String refresh) {

        // Access token: short-lived, set at root, httpOnly
        response.addHeader(HttpHeaders.SET_COOKIE,
                ResponseCookie.from("ACCESS_TOKEN", access)
                        .httpOnly(true)
                        .secure(false) // switched to false for local/dev where HTTPS may not be present
                        .sameSite("Lax")
                        .path("/")
                        .maxAge(15L * 60L)
                        .build().toString());

        // Refresh token: long-lived, put on the root path so browser will store/send it for refresh requests.
        // Use SameSite=Lax for broad local compatibility
        response.addHeader(HttpHeaders.SET_COOKIE,
                ResponseCookie.from("REFRESH_TOKEN", refresh)
                        .httpOnly(true)
                        .secure(false) // switched to false for local/dev
                        .sameSite("Lax")
                        .path("/") // root so it's available to refresh endpoint and visible to browser
                        .maxAge(2L * 24L * 60L * 60L)
                        .build().toString());
    }

    // made public so controller can call it for logout
    public void clearCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE,
                ResponseCookie.from("ACCESS_TOKEN", "")
                        .httpOnly(true)
                        .secure(false)
                        .sameSite("Lax")
                        .path("/")
                        .maxAge(0L).build().toString());

        response.addHeader(HttpHeaders.SET_COOKIE,
                ResponseCookie.from("REFRESH_TOKEN", "")
                        .httpOnly(true)
                        .secure(false)
                        .sameSite("Lax")
                        .path("/")
                        .maxAge(0L).build().toString());
    }


    public void changePassword(ChangePassword_Dto dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("User is not authenticated");
        }

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String email = userDetails.getUsername();

        Auth_User user = auth_repository.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // verify old password matches
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password does not match");
        }

        String encodedPassword = passwordEncoder.encode(dto.getNewPassword());
        user.setPassword(encodedPassword);
        auth_repository.save(user);
    }


}
