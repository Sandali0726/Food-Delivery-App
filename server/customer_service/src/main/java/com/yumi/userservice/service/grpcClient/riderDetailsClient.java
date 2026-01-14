package com.yumi.userservice.service.grpcClient;

import com.example.grpc.RiderDetailsRequest;
import com.example.grpc.RiderDetailsResponse;
import com.example.grpc.RiderDetailsServiceGrpc;
import com.yumi.userservice.dto.Rider.RiderDetailsDto;
import org.springframework.stereotype.Service;

@Service
public class riderDetailsClient {

    private final RiderDetailsServiceGrpc.RiderDetailsServiceBlockingStub stub;

    public riderDetailsClient(RiderDetailsServiceGrpc.RiderDetailsServiceBlockingStub stub) {
        this.stub = stub;
    }

    public RiderDetailsDto getRiderDetails(String email) {

        RiderDetailsRequest request = RiderDetailsRequest.newBuilder()
                .setRiderEmail(email)
                .build();

        RiderDetailsResponse response = stub.getRiderDetails(request);
        return RiderDetailsDto.builder()
                .rider_name(response.getRiderName())
                .rider_phone(response.getRiderPhone())
                .rider_image(response.getRiderImage())
                .vehicle_no(response.getVehicleNo())
                .delivery_count(String.valueOf(response.getDeliveryCount()))
                .rating(String.valueOf(response.getRating()))
                .build();
    }

}
