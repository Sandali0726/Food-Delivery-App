package com.example.riderservice.grpcClientService;

import com.example.grpc.TableStatusRequest;
import com.example.grpc.TableStatusResponse;
import com.example.grpc.TableStatusServiceGrpc;
import com.example.riderservice.enums.Delivery_status;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class customerOrderStatusClient {

    private final TableStatusServiceGrpc.TableStatusServiceBlockingStub stub;


    public String updateCustomerOrderStatus(Long orderId , String status) {

        // Implementation for getting order status via gRPC
        // You can build and send a request to the customer service here
        TableStatusRequest request = TableStatusRequest.newBuilder()
                .setTableId(orderId)
                .setStatus(status)
                .build();

        TableStatusResponse response = stub.changeTableStatus(request);
        System.out.println("🍽️ Customer Order Status response: " + response.getMessage());
        return "Order status for order ID: " + orderId;
    }

}
