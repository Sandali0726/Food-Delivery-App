package com.yumi.userservice.service.grpcClient;

import com.example.grpc.LocationRequest;
import com.example.grpc.RiderLocationQueryServiceGrpc;
import com.example.grpc.RiderLocationResponse;
import com.yumi.userservice.dto.Rider.RiderLocationDTO;
import org.springframework.stereotype.Service;

@Service
public class RiderLocationClient {
    private  final RiderLocationQueryServiceGrpc.RiderLocationQueryServiceBlockingStub stub;
    public RiderLocationClient(RiderLocationQueryServiceGrpc.RiderLocationQueryServiceBlockingStub stub) {
        this.stub = stub;
    }
    public RiderLocationDTO getCurrentLocation(Long orderId) {
        System.out.println("[RiderLocationClient] Requesting current location for orderId=" + orderId);
        LocationRequest request = LocationRequest.newBuilder()
                .setOrderId(orderId)
                .build();
        try {
            RiderLocationResponse response = stub.getCurrentLocation(request);
            System.out.println("[RiderLocationClient] Received response: orderId=" + response.getOrderId() +
                    ", lat=" + response.getLat() + ", lng=" + response.getLng());
            return RiderLocationDTO.builder()
                    .orderId(response.getOrderId())
                    .lat((float) response.getLat())
                    .lng((float) response.getLng())
                    .build();
        } catch (Exception e) {
            System.out.println("[RiderLocationClient] Error fetching rider location: " + e.getMessage());
            throw e;
        }
    }

}
