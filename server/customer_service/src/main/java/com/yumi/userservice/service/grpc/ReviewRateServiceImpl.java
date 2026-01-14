package com.yumi.userservice.service.grpc;

import com.example.grpc.*;
import com.yumi.userservice.dto.Rider.RiderReviewDto;
import com.yumi.userservice.mapper.RiderMapper;
import com.yumi.userservice.model.RiderReview;
import com.yumi.userservice.repository.RiderRepository;
import io.grpc.stub.StreamObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
public class ReviewRateServiceImpl extends ReviewRateServiceGrpc.ReviewRateServiceImplBase {

    @Autowired
    private RiderRepository riderRepository;

    @Autowired
    private RiderMapper riderMapper;
    @Override
    public void getReviewRate(ReviewRateRequest request,
                              StreamObserver<ReviewRateResponse> responseObserver) {

            long orderId = request.getOrderId();
            RiderReview review = riderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Review not found for order " + orderId));

            RiderReviewDto dto = riderMapper.toDto(review);

        ReviewRateResponse response = ReviewRateResponse.newBuilder()
                    .setReview(dto.getReview())
                    .setRating(dto.getRate())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

    }



}
