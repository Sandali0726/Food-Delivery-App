package com.restaurant_service.grpc;

import com.example.grpc.customer.CustomerDetailsRequest;
import com.example.grpc.customer.CustomerDetailsResponse;
import com.example.grpc.customer.CustomerServiceGrpc;
import com.restaurant_service.dto.CustomerDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CustomerGrpcClient {

    private static final Logger log = LoggerFactory.getLogger(CustomerGrpcClient.class);

    private final CustomerServiceGrpc.CustomerServiceBlockingStub blockingStub;

    public CustomerGrpcClient(CustomerServiceGrpc.CustomerServiceBlockingStub blockingStub) {
        this.blockingStub = blockingStub;
    }

    public CustomerDetailsResponse getCustomerByEmail(String email) {
        CustomerDetailsRequest request = CustomerDetailsRequest.newBuilder()
                .setCustomerEmail(email)
                .build();
        try {
            return blockingStub.getCustomerDetails(request);
        } catch (Exception ex) {
            log.error("gRPC call to customer service failed for email={}", email, ex);
            throw ex;
        }
    }

    // Convenience method used by application code that wants a simple DTO and safe handling.
    public Optional<CustomerDto> fetchCustomer(String email) {
        try {
            CustomerDetailsResponse response = getCustomerByEmail(email);
            if (response == null) {
                return Optional.empty();
            }
            CustomerDto dto = CustomerDto.builder()
                    .customerEmail(email)
                    .customerName(response.getCustomerName())
                    .customerPhone(response.getCustomerPhone())
                    .build();
            return Optional.of(dto);
        } catch (Exception ex) {
            // Don't propagate gRPC exceptions across layers; let callers decide based on empty optional.
            log.warn("Failed to fetch customer details for email={}: {}", email, ex.toString());
            return Optional.empty();
        }
    }
}
