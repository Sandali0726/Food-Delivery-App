package com.yumi.userservice.service.grpcClient;

import com.example.grpc.RiderRatingServiceGrpc;
import com.example.grpc.RiderRatingUpdateRequest;
import com.example.grpc.RiderRatingUpdateResponse;
import com.example.grpc.RiderReviewServiceGrpc;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RiderRatingClient {
    private final RiderRatingServiceGrpc.RiderRatingServiceBlockingStub stub;

    public String UpdateRiderRating(String riderEmail, float newRating) {

        RiderRatingUpdateRequest request = RiderRatingUpdateRequest.newBuilder()
                .setRiderEmail(riderEmail)
                .setNewRating(newRating)
                .build();

        // Call the gRPC service
        RiderRatingUpdateResponse response = stub.updateRiderRating(request);

        // Return the response message
        return response.getMessage();
       
    }

}
