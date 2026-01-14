package com.example.riderservice.grpcClientService;

import com.restaurant_service.grpc.RestaurantRequest;
import com.restaurant_service.grpc.RestaurantResponse;
import com.restaurant_service.grpc.RestaurantServiceGrpc;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class restaurantDetailsClient {

    private final RestaurantServiceGrpc.RestaurantServiceBlockingStub stub;

    public RestaurantResponse getRestaurantDetails(String email) {

        RestaurantRequest request = RestaurantRequest.newBuilder()
                .setEmail(email)
                .build();

        RestaurantResponse response = stub.getRestaurantBasicInfo(request);
        System.out.println("🍽️ Restaurant Details received: " + response);

        return response;
    }


}
