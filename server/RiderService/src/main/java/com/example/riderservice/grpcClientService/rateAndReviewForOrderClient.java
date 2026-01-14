package com.example.riderservice.grpcClientService;

import com.example.grpc.ReviewRateRequest;
import com.example.grpc.ReviewRateResponse;
import com.example.grpc.ReviewRateServiceGrpc;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class rateAndReviewForOrderClient {

    private final ReviewRateServiceGrpc.ReviewRateServiceBlockingStub stub;

    public ReviewRateResponse getRateAndReviewForOrder(Long orderId) {

        ReviewRateRequest request = ReviewRateRequest.newBuilder()
                .setOrderId(orderId)
                .build();

        ReviewRateResponse response = stub.getReviewRate(request);
        return response;
    }



}
