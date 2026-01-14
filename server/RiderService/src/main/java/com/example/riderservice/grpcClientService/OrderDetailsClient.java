package com.example.riderservice.grpcClientService;

import com.example.grpc.OrderDetailsRequest;
import com.example.grpc.OrderDetailsResponse;
import com.example.grpc.OrderServiceGrpc;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderDetailsClient {

    private final OrderServiceGrpc.OrderServiceBlockingStub stub;

    public OrderDetailsResponse getOrderDetails(Long orderId) {

        OrderDetailsRequest request = OrderDetailsRequest.newBuilder()
                .setOrderId(String.valueOf(orderId))
                .build();

        OrderDetailsResponse response = stub.getOrderDetails(request);

        System.out.println("📦 Order Details received: " + response);

        return response;
    }




}
