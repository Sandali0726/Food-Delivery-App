package com.restaurant_service.controller;

import com.example.grpc.customer.CustomerDetailsResponse;
import com.restaurant_service.dto.CustomerDto;
import com.restaurant_service.grpc.CustomerGrpcClient;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@Validated
public class CustomerController {

    private final CustomerGrpcClient customerGrpcClient;

    public CustomerController(CustomerGrpcClient customerGrpcClient) {
        this.customerGrpcClient = customerGrpcClient;
    }

    /**
     * GET /api/customers?email={email}
     * Returns 200 with CustomerDto when found, 404 when not found, 503 when customer service is unavailable.
     */
    @GetMapping
    public ResponseEntity<CustomerDto> getCustomerByEmail(
            @RequestParam("email") @NotBlank @Email String email) {
        try {
            // Use the raw gRPC call so we can observe transport errors vs empty response
            CustomerDetailsResponse resp = customerGrpcClient.getCustomerByEmail(email);
            if (resp == null || (resp.getCustomerName() == null || resp.getCustomerName().isEmpty())
                    && (resp.getCustomerPhone() == null || resp.getCustomerPhone().isEmpty())) {
                return ResponseEntity.notFound().build();
            }
            CustomerDto dto = CustomerDto.builder()
                    .customerEmail(email)
                    .customerName(resp.getCustomerName())
                    .customerPhone(resp.getCustomerPhone())
                    .build();
            return ResponseEntity.ok(dto);
        } catch (StatusRuntimeException ex) {
            // Map gRPC UNAVAILABLE to HTTP 503 so clients know the customer service is down/unreachable.
            if (ex.getStatus() != null && ex.getStatus().getCode() == Status.Code.UNAVAILABLE) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
            }
            // For other gRPC statuses, return 502 Bad Gateway with no body (could be adjusted)
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        } catch (Exception ex) {
            // Unexpected errors -> 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
