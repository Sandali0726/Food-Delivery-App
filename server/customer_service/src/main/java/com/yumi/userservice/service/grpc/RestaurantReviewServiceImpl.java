package com.yumi.userservice.service.grpc;

import com.example.grpc.restaurant.RestaurantReviewRequest;
import com.example.grpc.restaurant.RestaurantReviewResponse;
import com.example.grpc.restaurant.RestaurantReviewServiceGrpc;
import com.yumi.userservice.dto.Resturant.RestaurantReviewDto;
import com.yumi.userservice.mapper.RestaurantMapper;
import com.yumi.userservice.repository.RestaurantReviewRepository;
import io.grpc.stub.StreamObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.grpc.server.service.GrpcService;

import java.util.List;

@GrpcService
public class RestaurantReviewServiceImpl
    extends RestaurantReviewServiceGrpc.RestaurantReviewServiceImplBase {

        @Autowired
        private RestaurantReviewRepository restaurantRepository;

        @Autowired
        private RestaurantMapper restaurantMapper;

        @Override
        public void getRestaurantReviews(RestaurantReviewRequest request,
                                         StreamObserver<RestaurantReviewResponse> responseObserver) {

            String RestaurantEmail = request.getRestaurantEmail();

            List<RestaurantReviewDto> reviews =
                    restaurantRepository.findByRestaurantEmail(RestaurantEmail)
                            .stream()
                            .map(restaurantMapper::toDto)
                            .toList();

            if (reviews.isEmpty()) {
                responseObserver.onError(
                        io.grpc.Status.NOT_FOUND
                                .withDescription("No reviews for Restaurant: " + RestaurantEmail)
                                .asRuntimeException()
                );
                return;
            }

            RestaurantReviewResponse.Builder response = RestaurantReviewResponse.newBuilder();

            for (RestaurantReviewDto dto : reviews) {
                response.addReviews(
                        RestaurantReviewResponse.Review.newBuilder()
                                .setCustomerEmail(dto.getCustomerEmail())
                                .setReview(dto.getReview())
                                .setRestaurantRating(dto.getRate())
                                .setOrderId(dto.getOrderId())
                                .build()
                );
            }

            responseObserver.onNext(response.build());
            responseObserver.onCompleted();
        }
}
