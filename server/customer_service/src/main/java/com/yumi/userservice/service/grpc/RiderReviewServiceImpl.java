package com.yumi.userservice.service.grpc;

import com.example.grpc.RiderReviewRequest;
import com.example.grpc.RiderReviewResponse;
import com.example.grpc.RiderReviewServiceGrpc;
import com.yumi.userservice.dto.Rider.RiderReviewResponseDTO;
import com.yumi.userservice.mapper.RiderMapper;
import com.yumi.userservice.repository.RiderRepository;
import io.grpc.stub.StreamObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.grpc.server.service.GrpcService;
import java.util.List;
import com.google.protobuf.Timestamp;
import java.time.ZoneOffset;

@GrpcService
public class RiderReviewServiceImpl extends RiderReviewServiceGrpc.RiderReviewServiceImplBase {

    @Autowired
    private RiderRepository riderRepository;

    @Autowired
    private RiderMapper riderMapper;
    @Override
    public void getRiderReviews(RiderReviewRequest request,
                                StreamObserver<RiderReviewResponse> responseObserver) {

        String riderEmail = request.getRiderEmail();
        System.out.println("Received gRPC request for rider reviews with email: " + riderEmail);
        List<RiderReviewResponseDTO> reviews =
                riderRepository.findByRiderEmail(riderEmail)
                        .stream()
                        .map(riderMapper::toDtoResponse)
                        .toList();
        System.out.println("Found " + reviews.size() + " reviews for rider: " + riderEmail);
        if (reviews.isEmpty()) {
            responseObserver.onError(
                    io.grpc.Status.NOT_FOUND
                            .withDescription("No reviews for rider: " + riderEmail)
                            .asRuntimeException()
            );
            return;
        }

        RiderReviewResponse.Builder response = RiderReviewResponse.newBuilder();
        System.out.println("Building gRPC response with reviews..."+response);
       for (RiderReviewResponseDTO dto : reviews) {
            // Convert LocalDateTime to google.protobuf.Timestamp using UTC
            Timestamp createdAtTs = Timestamp.newBuilder()
                    .setSeconds(dto.getCreatedAt().toEpochSecond(ZoneOffset.UTC))
                    .setNanos(dto.getCreatedAt().getNano())
                    .build();

            response.addReviews(
                    RiderReviewResponse.Review.newBuilder()
                            .setCustomerEmail(dto.getCustomerEmail())
                            .setReview(dto.getReview())
                            .setRiderRating(dto.getRate())
                            .setOrderId(dto.getOrderId())
                            .setCreatedAt(createdAtTs)
                            .build()
            );

        }
        System.out.println("Building gRPC response with reviews..."+response);
        responseObserver.onNext(response.build());
        responseObserver.onCompleted();
    }

}
