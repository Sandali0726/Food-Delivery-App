package com.restaurant_service.service;
import com.restaurant_service.dto.LocationDto;
import com.restaurant_service.dto.Profile_Dto;
import com.restaurant_service.mapper.Profile_Mapper;
import com.restaurant_service.model.Auth_User;
import com.restaurant_service.model.Resturant_Profile;
import com.restaurant_service.repository.Auth_Repository;
import com.restaurant_service.repository.Restaurant_Profile_Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class Profile_Service {

    private final Profile_Mapper profileMapper;
    private final Restaurant_Profile_Repository profileRepository;
    private final Auth_Repository authRepository;
    private static final Logger logger = LoggerFactory.getLogger(Profile_Service.class);

    public Profile_Service(Profile_Mapper profileMapper, Restaurant_Profile_Repository profileRepository, Auth_Repository authRepository) {
        this.profileRepository = profileRepository;
        this.profileMapper = profileMapper;
        this.authRepository = authRepository;
    }

    @Transactional
    public ResponseEntity<?> creteateProfile(Profile_Dto profileDto) {

        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String email = userDetails.getUsername();

            // load managed Auth_User from DB within this transaction to avoid inserting a duplicate
            Auth_User user = authRepository.findById(email)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found in DB: " + email));

            Resturant_Profile mapped = profileMapper.toEntity(profileDto);

            // If profile already exists: load and update fields to avoid JPA optimistic locking / insert conflicts
            if (profileRepository.existsById(email)) {
                Resturant_Profile existing = profileRepository.findById(email).orElseThrow();
                // copy updatable fields from mapped to existing
                existing.setName(mapped.getName());
                existing.setContactNumber(mapped.getContactNumber());
                existing.setCoverImageUrl(mapped.getCoverImageUrl());
                existing.setProfileImageUrl(mapped.getProfileImageUrl());
                existing.setDescription(mapped.getDescription());
                existing.setLatitude(mapped.getLatitude());
                existing.setLongitude(mapped.getLongitude());
                existing.setOpen(mapped.isOpen());
                // ensure relationship remains intact with managed user
                existing.setAuthUser(user);

                profileRepository.save(existing);
            } else {
                // new profile
                mapped.setId(email);
                mapped.setAuthUser(user);
                profileRepository.save(mapped);
            }
            return ResponseEntity.ok("Profile created successfully");
        }

        catch (Exception e){
            logger.error("Error creating profile for dto={}, cause={}", profileDto, e.toString());
            logger.debug("Profile creation exception: ", e);
            return ResponseEntity.status(500).body("An error occurred while creating the profile.");
        }

    }

    public Profile_Dto getProfileById() {
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String id = userDetails.getUsername();
            Resturant_Profile profile = profileRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Profile not found with id: " + id));
            return profileMapper.toDto(profile);
        } catch (Exception e){
            logger.error("Error fetching profile", e);
            return null ;
        }
    }

    @Transactional
    public ResponseEntity<?> updateProfile(Profile_Dto profileDto) {
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String id = userDetails.getUsername();

            // load managed user
            Auth_User user = authRepository.findById(id)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found in DB: " + id));

            Resturant_Profile mapped = profileMapper.toEntity(profileDto);

            Resturant_Profile existing = profileRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Profile not found with id: " + id));

            // copy updatable fields
            existing.setName(mapped.getName());
            existing.setContactNumber(mapped.getContactNumber());
            existing.setCoverImageUrl(mapped.getCoverImageUrl());
            existing.setProfileImageUrl(mapped.getProfileImageUrl());
            existing.setDescription(mapped.getDescription());
            existing.setLatitude(mapped.getLatitude());
            existing.setLongitude(mapped.getLongitude());
            existing.setOpen(mapped.isOpen());
            existing.setAuthUser(user);

            profileRepository.save(existing);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e){
            logger.error("Error updating profile", e);
            return ResponseEntity.status(500).body("An error occurred while updating the profile.");
        }
    }

    public boolean deleteProfileById() {
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String id = userDetails.getUsername();
            profileRepository.deleteById(id);
            return true;
        } catch (Exception e){
            logger.error("Error deleting profile", e);
            return false;
        }
    }

    public boolean isProfileExists() {
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof AnonymousAuthenticationToken) {
                throw new AccessDeniedException("User is not authenticated");
            }
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String id = userDetails.getUsername();
            return profileRepository.existsById(id);
        } catch (Exception e){
            logger.error("Error checking if profile exists", e);
            return false;
        }
    }

    public List<Profile_Dto> getRestaurants() {
        try{
            List<Resturant_Profile> profiles = profileRepository.findAll();
            return profiles.stream().map(profileMapper::toDto).collect(Collectors.toList());
        } catch (Exception e){
            logger.error("Error fetching restaurant profiles", e);
            return Collections.emptyList();
        }
    }

    public Profile_Dto PgetProfileById(String restaurantEmail) {
        String id = restaurantEmail;
        try{
            Resturant_Profile profile = profileRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Profile not found with id: " + id));
            return profileMapper.toDto(profile);
        } catch (Exception e){
            logger.error("Error fetching profile", e);
            return null ;
        }
    }

    public LocationDto getRestaurantLocation(String restaurantEmail) {
        try {
            Resturant_Profile profile = profileRepository.findById(restaurantEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Profile not found with email: " + restaurantEmail));
            return LocationDto.builder()
                    .latitude(profile.getLatitude())
                    .longitude(profile.getLongitude())
                    .build();
        } catch (Exception e) {
            logger.error("Error fetching restaurant location for email={}", restaurantEmail, e);
            return null;
        }
    }


}
