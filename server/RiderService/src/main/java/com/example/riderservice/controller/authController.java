package com.example.riderservice.controller;

import com.example.riderservice.dto.authDto;
import com.example.riderservice.dto.currentLocationDto;
import com.example.riderservice.dto.emailVerificationDto;
import com.example.riderservice.dto.registerDto;
import com.example.riderservice.exception.EmailNotVerifiedException;
import com.example.riderservice.service.authService;
import com.example.riderservice.service.emailVerificationService;
import com.example.riderservice.service.forgotPasswordService;
import com.example.riderservice.service.resetPasswordService;
import com.example.riderservice.service.refreshTokenService;
import com.example.riderservice.utility.cloudinaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@RestController
public class authController {

  private final authService authService;
  private final refreshTokenService refreshTokenService;
  private final cloudinaryService cloudinaryService;
  private final Validator validator;
  private final forgotPasswordService forgotPasswordService;
  private final resetPasswordService resetPasswordService;
  private final emailVerificationService emailVerificationService;

    public authController(authService authService, refreshTokenService refreshTokenService,
                         cloudinaryService cloudinaryService, Validator validator,
                          forgotPasswordService forgotPasswordService,
                          resetPasswordService resetPasswordService,
                          emailVerificationService emailVerificationService) {
      this.cloudinaryService = cloudinaryService;
      this.refreshTokenService = refreshTokenService;
      this.authService = authService;
      this.validator = validator;
      this.forgotPasswordService = forgotPasswordService;
      this.resetPasswordService = resetPasswordService;
      this.emailVerificationService = emailVerificationService;
    }

  @PostMapping(value = "/api/auth/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<registerDto> registerRider(@RequestPart("data") String request, @RequestPart("file") MultipartFile image) throws IOException {
    System.out.println("Received registration request: " + request);

    // Convert JSON string to DTO
    ObjectMapper objectMapper = new ObjectMapper();
    registerDto registerDto = objectMapper.readValue(request, registerDto.class);

    // Manually validate the DTO after conversion
    Set<ConstraintViolation<registerDto>> violations = validator.validate(registerDto);

    if (!violations.isEmpty()) {
      StringBuilder errorMessage = new StringBuilder("Validation failed: ");
      for (ConstraintViolation<registerDto> violation : violations) {
        errorMessage.append(violation.getPropertyPath()).append(" - ").append(violation.getMessage()).append("; ");
      }
      throw new ConstraintViolationException("Validation failed", violations);
    }

    // Check if email is verified before allowing registration
    if (!emailVerificationService.isEmailVerified(registerDto.getEmail())) {
      throw new EmailNotVerifiedException("Email must be verified before registration. Please verify your email first.");
    }

    String imageUrl = cloudinaryService.upload(image);
    registerDto.setImg_url(imageUrl);
    registerDto response = authService.registerRider(registerDto);
    return ResponseEntity.status(201).body(response);
  }

  @PostMapping("/api/auth/login")
  public ResponseEntity<?> loginRider(@Valid @RequestBody authDto auth) {
    Map<String,String> token = authService.verify(auth);

    ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", token.get("refreshToken"))
            .httpOnly(true)
            .path("/")
            .maxAge(7 * 24 * 60 * 60) // 7 days
            .build();

    ResponseCookie  accessCookie= ResponseCookie.from("accessToken", token.get("accessToken"))
            .httpOnly(true)
            .path("/")
            .maxAge(15 * 60) // 15 minutes
            .build();

    refreshTokenService.save(
            token.get("refreshToken"),
            auth.getEmail(),
            java.time.Instant.now().plusSeconds(7 * 24 * 60 * 60)
    );

    return ResponseEntity.ok()
            .header("Set-Cookie", refreshCookie.toString())
            .header("Set-Cookie", accessCookie.toString())
            .body(Map.of("message", "Login successful"));
  }

  @PostMapping("/api/auth/logout")
  public ResponseEntity<?> logoutRider(Authentication auth,HttpServletResponse response) {
      ResponseCookie deleteRefreshCookie = ResponseCookie.from("refreshToken", "")
              .httpOnly(true)
              .path("/")
              .maxAge(0) // Expire immediately
              .build();

      ResponseCookie deleteAccessCookie = ResponseCookie.from("accessToken", "")
              .httpOnly(true)
              .path("/")
              .maxAge(0) // Expire immediately
              .build();
      String email = auth.getName();
      System.out.println("Logging out user: " + email);

      refreshTokenService.revokeAll(email);

      return ResponseEntity.ok()
              .header("Set-Cookie", deleteRefreshCookie.toString())
              .header("Set-Cookie", deleteAccessCookie.toString())
              .body(Map.of("message", "Logout successful"));
  }

  @PostMapping("/api/auth/refresh")
  public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response){

      String refreshToken = null;

      if(request.getCookies()== null){
          return ResponseEntity.status(401).body(Map.of("message","No cookies found"));
      }

      for(Cookie cookie : request.getCookies()){
         if("refreshToken".equals(cookie.getName())){
            refreshToken = cookie.getValue();
         }
      }
      if(refreshToken == null){
          return ResponseEntity.status(401).body(Map.of("message","No refresh token found"));
      }
      Map<String,String> token = authService.refreshToken(refreshToken);

        ResponseCookie newRefreshCookie = ResponseCookie.from("refreshToken", token.get("refreshToken"))
                .httpOnly(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .build();
        ResponseCookie  newAccessCookie= ResponseCookie.from("accessToken", token.get("accessToken"))
                .httpOnly(true)
                .path("/")
                .maxAge(15 * 60) // 15 minutes
                .build();
        response.addHeader("Set-Cookie", newRefreshCookie.toString());
        response.addHeader("Set-Cookie", newAccessCookie.toString());

      return ResponseEntity.ok()
              .body(Map.of("message", "Token refreshed successfully"));



  }


    @PostMapping("api/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        forgotPasswordService.sendOtp(email);
        return ResponseEntity.ok("If email exists, OTP sent");
    }

    @PostMapping("api/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword
    ) {

        try {
            resetPasswordService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok("Password updated");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("api/change-password")
    public ResponseEntity<?> changePassword(
            @RequestParam String email,
            @RequestParam String oldPassword,
            @RequestParam String newPassword
    ) {
        try {
            String message = authService.changePassword(email, newPassword, oldPassword);
            return ResponseEntity.status(201).body(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/api/auth/send-email-otp")
    public ResponseEntity<?> sendEmailOtp(@RequestParam String email) {
        try {
            // Check if email already exists
            if (authService.checkUserExists(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
            }

            emailVerificationService.sendVerificationOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email for verification"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/api/auth/verify-email-otp")
    public ResponseEntity<?> verifyEmailOtp(@Valid @RequestBody emailVerificationDto verificationDto) {
        try {
            boolean verified = emailVerificationService.verifyEmail(verificationDto.getEmail(), verificationDto.getOtp());
            if (verified) {
                return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now register."));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Email verification failed"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/api/auth/resend-email-otp")
    public ResponseEntity<?> resendEmailOtp(@RequestParam String email) {
        try {
            emailVerificationService.resendVerificationOtp(email);
            return ResponseEntity.ok(Map.of("message", "New OTP sent to your email"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/api/auth/update-location")
    public ResponseEntity<?> updateCurrentLocation(@RequestBody currentLocationDto location){
        try {
            currentLocationDto updatedLocation = authService.updateLocation(location);
            return ResponseEntity.ok(updatedLocation);
        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

  @GetMapping("/api/auth/hello")
  public String hello() {
    return "Hiipp from Rider Service!";
  }


}
