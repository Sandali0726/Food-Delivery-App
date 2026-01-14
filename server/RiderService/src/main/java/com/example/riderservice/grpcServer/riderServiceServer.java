package com.example.riderservice.grpcServer;

import com.example.grpc.RiderRatingServiceGrpc;
import com.example.grpc.RiderRatingUpdateRequest;
import com.example.grpc.RiderRatingUpdateResponse;
import com.example.riderservice.repository.riderRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

import java.math.BigDecimal;

@GrpcService
@RequiredArgsConstructor
public class riderServiceServer extends RiderRatingServiceGrpc.RiderRatingServiceImplBase {

    private final riderRepository riderRepository;

    @Override
    public void updateRiderRating(RiderRatingUpdateRequest request , StreamObserver<RiderRatingUpdateResponse> response) {

        String riderEmail = request.getRiderEmail();
        float newRating = request.getNewRating();

        try {
            var riderOpt = riderRepository.findByEmail(riderEmail);
            if (riderOpt == null) {
                response.onError(
                        io.grpc.Status.NOT_FOUND
                                .withDescription("Rider not found with email: " + riderEmail)
                                .asRuntimeException()
                );
                return;
            }

            var rider = riderOpt;
            rider.setRating(BigDecimal.valueOf(newRating));
            riderRepository.save(rider);

            RiderRatingUpdateResponse grpcResponse = RiderRatingUpdateResponse.newBuilder()
                    .setMessage("Rider rating updated successfully")
                    .build();

            response.onNext(grpcResponse);
            response.onCompleted();
        } catch (Exception e) {
            response.onError(
                    io.grpc.Status.INTERNAL
                            .withDescription("Error updating rider rating: " + e.getMessage())
                            .asRuntimeException()
            );
        }



    }




}
