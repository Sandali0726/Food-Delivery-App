package com.yumi.userservice.controller;

import jakarta.validation.Valid;
import com.yumi.userservice.dto.Profile.ProfileDto;
import com.yumi.userservice.dto.Profile.UserDetailsDto;
import com.yumi.userservice.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {
    @Autowired
    private  CustomerService customerService;

    // ================= GET CUSTOMER PROFILE =================
    @GetMapping("/{email}")
    public ResponseEntity<?> getCustomerProfile(@PathVariable String email) {
        try {
            // Use the service method designed to fetch by email to avoid 404s when ID != email
            UserDetailsDto userDetails = customerService.getUserDetails(email);
            return ResponseEntity.ok(userDetails);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    // ================= COMPLETE PROFILE =================
    @PutMapping("/{email}/complete")
    public ResponseEntity<?> completeProfile(
            @PathVariable String email,
            @Valid @RequestBody ProfileDto dto) {
        try {
            UserDetailsDto savedProfile = customerService.completeProfile(email, dto);
            return ResponseEntity.ok(savedProfile);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
    @PutMapping("/{email}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String email,
            @Valid @RequestBody ProfileDto dto) {
        try {
            UserDetailsDto updatedProfile = customerService.updateProfile(email, dto);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
