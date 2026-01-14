package com.restaurant_service.grpc;

import com.restaurant_service.model.Resturant_Profile;
import com.restaurant_service.repository.Restaurant_Profile_Repository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class RestaurantGrpcService
        extends RestaurantServiceGrpc.RestaurantServiceImplBase {

    private final Restaurant_Profile_Repository profileRepository;

    public RestaurantGrpcService(Restaurant_Profile_Repository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    public void getRestaurantBasicInfo(
            RestaurantRequest request,
            StreamObserver<RestaurantResponse> responseObserver
    ) {
        profileRepository.findById(request.getEmail())
                .ifPresentOrElse(profile -> {

                    RestaurantResponse response = RestaurantResponse.newBuilder()
                            .setName(profile.getName())
                            .setContactNumber(
                                    String.valueOf(profile.getContactNumber())
                            )
                            .build();

                    responseObserver.onNext(response);
                    responseObserver.onCompleted();

                }, () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Restaurant not found")
                                .asRuntimeException()
                ));
    }
}