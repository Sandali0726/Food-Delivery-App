package com.example.riderservice.grpcClientService;

import com.example.grpc.RiderDetailsServiceGrpc;
import com.example.grpc.RiderReviewRequest;
import com.example.grpc.RiderReviewResponse;
import com.example.grpc.RiderReviewServiceGrpc;
import com.example.riderservice.dto.reviewRatingDto;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;

import java.util.List;

@Service
public class riderRateAndReviewClient {

   private final RiderReviewServiceGrpc.RiderReviewServiceBlockingStub stub;

    public riderRateAndReviewClient(RiderReviewServiceGrpc.RiderReviewServiceBlockingStub stub) {
        this.stub = stub;
    }

    public List<reviewRatingDto> getReviewsAndRatings(String email) {

        RiderReviewRequest request = RiderReviewRequest.newBuilder()
                .setRiderEmail(email)
                .build();

        List<reviewRatingDto> response =  stub.getRiderReviews(request).getReviewsList()
                .stream()
                .map(
                        review -> reviewRatingDto.builder()
                                .customerEmail(review.getCustomerEmail())
                                .review(review.getReview())
                                .rating(review.getRiderRating())
                                .orderId(review.getOrderId())
                                .createdAt(Instant.ofEpochSecond(review.getCreatedAt().getSeconds(), review.getCreatedAt().getNanos()))
                                .build()
                ).toList(
                );

        System.out.println("⭐ Rider Reviews and Ratings: " + response);

        return response;

    }



}
