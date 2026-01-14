package com.example.riderservice.grpcClientService;

import com.example.grpc.customer.CustomerDetailsRequest;
import com.example.grpc.customer.CustomerDetailsResponse;
import com.example.grpc.customer.CustomerServiceGrpc;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class customerDetailsClient {

    private final CustomerServiceGrpc.CustomerServiceBlockingStub stub;

    public CustomerDetailsResponse getCustomerDetails(String email) {

        CustomerDetailsRequest request = CustomerDetailsRequest.newBuilder()
                .setCustomerEmail(email)
                .build();

        CustomerDetailsResponse response = stub.getCustomerDetails(request);
        System.out.println("👤 Customer Details received: " + response);

        return response;
    }



}
