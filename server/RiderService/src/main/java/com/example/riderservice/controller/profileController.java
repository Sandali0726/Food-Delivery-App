package com.example.riderservice.controller;


import com.example.grpc.RiderReviewResponse;
import com.example.riderservice.dto.DeliveryStaticsDto;
import com.example.riderservice.dto.profileDto;
import com.example.riderservice.dto.reviewRatingDto;
//import com.example.riderservice.grpcClientService.riderOrderGrpcClient;
import com.example.riderservice.grpcClientService.riderRateAndReviewClient;
import com.example.riderservice.model.rider;
import com.example.riderservice.service.profileService;
import com.example.riderservice.utility.cloudinaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class profileController {

    private final profileService profileService;
    public final Validator validator;
    private final cloudinaryService cloudinaryService;
//    private final riderOrderGrpcClient grpcClient;
    private final riderRateAndReviewClient rateReviewGrpcClient;

    @GetMapping("/api/profile/getdetails")
    public ResponseEntity<?> getProfile(@RequestParam String email){

        return ResponseEntity.status(201).body(profileService.getProfile(email));
    }

    @PostMapping(value = "/api/profile/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(@RequestPart("data") String request, @RequestPart("file") MultipartFile image) throws IOException {
        System.out.println("Received registration request: " + request);

        // Convert JSON string to DTO
        ObjectMapper objectMapper = new ObjectMapper();
        profileDto profileDto = objectMapper.readValue(request, profileDto.class);

        // Manually validate the DTO after conversion
        Set<ConstraintViolation<profileDto>> violations = validator.validate(profileDto);

        if (!violations.isEmpty()) {
            StringBuilder errorMessage = new StringBuilder("Validation failed: ");
            for (ConstraintViolation<profileDto> violation : violations) {
                errorMessage.append(violation.getPropertyPath()).append(" - ").append(violation.getMessage()).append("; ");
            }
            throw new ConstraintViolationException("Validation failed", violations);
        }


        if(!image.isEmpty()){
            String imageUrl = cloudinaryService.upload(image);
            profileDto .setImg_url(imageUrl);
        }


        try{
        return ResponseEntity.status(201).body(profileService.updateProfile(profileDto ));
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/api/profile/change-status/{email}")
    public ResponseEntity<?> changeStatus(@PathVariable String email){
        try{
            String status = profileService.changeStatus(email);
            return ResponseEntity.ok(status);
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/api/rider/orders/{orderId}")
    public ResponseEntity<String> acceptOrder(@PathVariable Long orderId) {

//        grpcClient.acceptOrder(orderId);
        return ResponseEntity.ok("Order accepted by rider");
    }

    @GetMapping("/api/rider/reviews")
    public ResponseEntity<?> getReviewsAndRatings(@RequestParam String email) {
      try {
          List<reviewRatingDto> response = rateReviewGrpcClient.getReviewsAndRatings(email);
          return ResponseEntity.ok(response);
      }catch(Exception e){
          return ResponseEntity.status(500).body(e.getMessage());
      }
    }

    @GetMapping("/api/rider/statistics")
    public ResponseEntity<?> getRiderStatistics(@RequestParam String email) {
        try {
            DeliveryStaticsDto response = profileService.getDeliveryStatistics(email);
            return ResponseEntity.ok(response);
        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    @GetMapping("/api/rider/status")
    public ResponseEntity<?> getRiderStatus(@RequestParam String email) {
        try {
            String response = profileService.getStatus(email);
            return ResponseEntity.ok(response);
        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }


}
