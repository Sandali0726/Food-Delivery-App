package com.yumi.userservice.controller;

import com.example.grpc.RiderReviewRequest;
import com.example.grpc.RiderReviewResponse;
import com.yumi.userservice.dto.Rider.RiderReviewDto;
import com.yumi.userservice.service.RiderService;
import com.yumi.userservice.service.grpc.RiderReviewServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers/rider")
@CrossOrigin(origins = "http://localhost:3000")
public class RiderController {

    @Autowired
    private RiderService riderService;

    @PutMapping("/review")
    public ResponseEntity<?> saveReview(@Valid @RequestBody RiderReviewDto req) {
        riderService.saveReview(req);
        return ResponseEntity.ok(Map.of("message", "Review submitted successfully"));
    }

    // Support query param usage: /api/customers/rider?email=...
    @GetMapping
    public ResponseEntity<List<RiderReviewDto>> getAllReviewsByRiderEmailQuery(@RequestParam("email") String email) {
        List<RiderReviewDto> reviews = riderService.getByEmail(email);
        if (reviews.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(reviews);
    }
    @GetMapping("/review-by-order")
    public ResponseEntity<RiderReviewDto> getRiderReviewByOrderId(@RequestParam("orderId") Long orderId) {
        RiderReviewDto review = riderService.getRiderReviewbyorderid(orderId);
        if (review == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(review);
    }
//    public ResponseEntity<?> getRiderReview(@RequestParam String email){
//        RiderReviewRequest request = RiderReviewRequest.newBuilder()
//                .setRiderEmail(email)
//                .build();
//
//    }
}