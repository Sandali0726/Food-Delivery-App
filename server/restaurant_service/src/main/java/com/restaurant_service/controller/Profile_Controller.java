package com.restaurant_service.controller;

import com.restaurant_service.dto.Profile_Dto;
import com.restaurant_service.service.Profile_Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
public class Profile_Controller {

    private final Profile_Service profile_Service;
    private static final Logger logger = LoggerFactory.getLogger(Profile_Controller.class);

    public Profile_Controller(Profile_Service profile_Service) {
        this.profile_Service = profile_Service;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createProfile(@RequestBody Profile_Dto profileDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            logger.info("createProfile called by principal={}, authenticated={}, authorities={}",
                    auth.getName(), auth.isAuthenticated(), auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(",")));
        } else {
            logger.info("createProfile called with no authentication present");
        }
        return profile_Service.creteateProfile(profileDto);
    }

    @GetMapping
    public ResponseEntity<Profile_Dto> getProfile() {
        Profile_Dto dto = profile_Service.getProfileById();
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody Profile_Dto profileDto) {
        return profile_Service.updateProfile(profileDto);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteProfile() {
        boolean deleted = profile_Service.deleteProfileById();
        if (deleted) {
            return ResponseEntity.ok("Profile deleted successfully");
        }
        return ResponseEntity.status(500).body("Failed to delete profile");
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> isProfileExists() {
        boolean exists = profile_Service.isProfileExists();
        return ResponseEntity.ok(exists);
    }

    // Debug endpoint: returns current principal name and authorities (authenticated users only)
    @GetMapping("/whoami")
    public ResponseEntity<String> whoami() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("No authenticated user");
        }
        String authorities = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(","));
        return ResponseEntity.ok("principal=" + auth.getName() + " authorities=" + authorities);
    }

    @GetMapping("/p-restaurant")
    public ResponseEntity<List<Profile_Dto>> getProfileRestaurant() {
        List<Profile_Dto> dtos =profile_Service.getRestaurants();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/p-restaurantdetails")
    public ResponseEntity<Profile_Dto> getProfile(@RequestParam ("email") String restaurantEmail) {
        Profile_Dto dto = profile_Service.PgetProfileById( restaurantEmail);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }
}
