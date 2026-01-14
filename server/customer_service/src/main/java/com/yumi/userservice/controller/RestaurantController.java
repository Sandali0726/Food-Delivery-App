package com.yumi.userservice.controller;

import com.yumi.userservice.dto.Resturant.RestaurantReviewDto;
import com.yumi.userservice.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/restaurants")
@CrossOrigin(origins = "http://localhost:3000")
public class RestaurantController {
    @Autowired
    private RestaurantService restaurantService;
    @PutMapping("/review")
    public ResponseEntity<?> saveReview(@Valid @RequestBody RestaurantReviewDto dto) {
        restaurantService.saveReview(dto);
        return ResponseEntity.ok(Map.of("message", "Review submitted successfully"));
    }
    @GetMapping("/reviews/by-email")
    public ResponseEntity<List<RestaurantReviewDto>> getAllReviewsByRestaurantEmailQuery(@RequestParam("email") String email) {
        List<RestaurantReviewDto> reviews = restaurantService.getByEmail(email);
        if (reviews.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(reviews);
    }
    @GetMapping("/reviews")
    public ResponseEntity<List<RestaurantReviewDto>> getAllReviews() {
        List<RestaurantReviewDto> reviews = restaurantService.getAllReviews();
        if (reviews.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(reviews);
    }
    @GetMapping("/reviews/avg")
    public ResponseEntity<Float> getAverageRating(@RequestParam("email") String email) {
        Float avgRating = restaurantService.getAverageRating(email);
        return ResponseEntity.ok(avgRating);
    }
    @GetMapping("/reviews/by-order")
    public ResponseEntity<RestaurantReviewDto> getRestaurantReviewByOrderId(@RequestParam("orderId") Long orderId) {
        RestaurantReviewDto review = restaurantService.getRestaurantReviewByOrderId(orderId);
        if (review == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(review);
    }
}
