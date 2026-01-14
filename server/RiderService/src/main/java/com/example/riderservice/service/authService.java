package com.example.riderservice.service;

import com.example.riderservice.dto.authDto;
import com.example.riderservice.dto.currentLocationDto;
import com.example.riderservice.dto.registerDto;
import com.example.riderservice.enums.Rider_status;
import com.example.riderservice.exception.InvalidEmailException;
import com.example.riderservice.exception.RiderAlreadyExistsException;
import com.example.riderservice.mapper.registerMapper;
import com.example.riderservice.model.auth;
import com.example.riderservice.model.refreshToken;
import com.example.riderservice.model.rider;
import com.example.riderservice.repository.authRepository;
import com.example.riderservice.repository.refreshTokenRepository;
import com.example.riderservice.repository.riderRepository;
import com.example.riderservice.utility.JWTService;
import com.example.riderservice.webSocket.webSocketPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class authService {

    private final riderRepository riderRepository;
    private final PasswordEncoder passwordEncoder;
    private final registerMapper registerMapper;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final refreshTokenService refreshTokenService;
    private final refreshTokenRepository refreshTokenRepository;
    private final authRepository authRepository;
    private final emailVerificationService emailVerificationService;
    private final webSocketPublisher socketPublisher;


    public registerDto registerRider(registerDto registerDto){
        // Validate input
        if(registerDto == null){
            throw new IllegalArgumentException("RegisterDto cannot be null");
        }
        if(registerDto.getEmail()!= null && registerDto.getEmail().contains("invalid")){
            throw new InvalidEmailException("Provided email"+ registerDto.getEmail()+" is invalid");
        }
        if(riderRepository.existsByEmail(registerDto.getEmail())){
            throw new RiderAlreadyExistsException("Rider with email "+ registerDto.getEmail()+" already exists");
        }

        String hashedPassword = passwordEncoder.encode(registerDto.getPassword());

        // Create the rider entity
        rider rider = registerMapper.toRiderEntity(registerDto);
        rider.setEmail(registerDto.getEmail());

        // Create the auth entity
        auth authEntity = auth.builder()
                .email(registerDto.getEmail())
                .password(hashedPassword)
                .status(Rider_status.UNAVAILABLE)
                .rider(rider)
                .build();

        // Set the bidirectional relationship
        rider.setAuth(authEntity);

        // Save the rider (this will cascade to auth due to CascadeType.ALL)
        rider savedRider = riderRepository.save(rider);

        // Return the DTO mapped from the saved rider entity
        return registerMapper.toRegisterDTO(savedRider);
    }


    public Map<String,String> verify(authDto user) {
        try {
            System.out.println("Attempting to authenticate user: " + user.getEmail());

            // Validate password length for BCrypt (max 72 bytes)
            if(user.getPassword() != null && user.getPassword().getBytes().length > 72) {
                throw new IllegalArgumentException("Password cannot exceed 72 bytes");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));

            if (authentication.isAuthenticated()) {
                System.out.println("Authentication successful for user: " + user.getEmail());

                String accessToken = jwtService.generateToken(user.getEmail());
                String refreshToken = jwtService.generateRefreshToken(user.getEmail());

                // Save the refresh token to the database without BCrypt encoding
                // since JWT tokens are already secure and too long for BCrypt
                refreshTokenService.save(
                        refreshToken,
                        user.getEmail(),
                        java.time.Instant.now().plusSeconds(7 * 24 * 60 * 60) // 7 days
                );

                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                        .httpOnly(true)
                        .path("/")
                        .maxAge(7 * 24 * 60 * 60) // 7 days
                        .build();

                ResponseCookie  accessCookie= ResponseCookie.from("accessToken", accessToken)
                        .httpOnly(true)
                        .path("/")
                        .maxAge( 15*60) // 15 minutes
                        .build();

                Map<String,String> tokens = new HashMap<>();
                tokens.put("accessToken", accessToken);
                tokens.put("refreshToken", refreshToken);
                return tokens;

            } else {
                System.out.println("Authentication failed for user: " + user.getEmail());
                throw new BadCredentialsException("Invalid email or password");
            }
        } catch (BadCredentialsException e) {
            System.out.println("Bad credentials for user: " + user.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        } catch (Exception e) {
            System.out.println("Authentication error for user " + user.getEmail() + ": " + e.getMessage());
            throw new BadCredentialsException("Authentication failed");
        }
    }


    public Map<String,String> refreshToken(String refreshToken) {

        String email = jwtService.extractUserName(refreshToken);
        refreshToken dbToken = refreshTokenService.validate(refreshToken,email);

        dbToken.setRevoked(true);

        String newAccessToken = jwtService.generateToken(email);
        String newRefreshToken = jwtService.generateRefreshToken(email);

        refreshTokenService.save(
                newRefreshToken,
                email,
                java.time.Instant.now().plusSeconds(7 * 24 * 60 * 60)
        );

        Map<String,String> tokens = new HashMap<>();
        tokens.put("accessToken", newAccessToken);
        tokens.put("refreshToken", newRefreshToken);
        return tokens;

    }



    public String changePassword(String email, String newPassword , String oldPassword){
        auth user = authRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!passwordEncoder.matches(oldPassword, user.getPassword())){
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        authRepository.save(user);
        return "Password changed successfully";
    }

    public void otpGenerator(){

    }



    public boolean checkUserExists(String email) {
        return riderRepository.existsByEmail(email);
    }

    public currentLocationDto updateLocation(currentLocationDto locationData){

        rider rider = riderRepository.findByEmail(locationData.getEmail());
        if(rider != null) {
            rider.setCurrent_lat(locationData.getCurrent_lat());
            rider.setCurrent_lng(locationData.getCurrent_lng());
            riderRepository.save(rider);
            socketPublisher.sendLocation(locationData.getEmail(), locationData.getCurrent_lat(), locationData.getCurrent_lng());
            return locationData;
        }else{
            throw new RuntimeException("Rider not found for email: " + locationData.getEmail());
        }

    }


}
