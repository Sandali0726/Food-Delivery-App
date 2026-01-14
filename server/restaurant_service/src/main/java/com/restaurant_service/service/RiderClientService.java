package com.restaurant_service.service;

import com.restaurant_service.dto.RiderDto;
import com.restaurant_service.grpc.RiderDetailsResponse;
import com.restaurant_service.grpc.RiderDetailsRequest;
import com.restaurant_service.grpc.RiderDetailsServiceGrpc;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class RiderClientService {

    private final RiderDetailsServiceGrpc.RiderDetailsServiceBlockingStub riderStub;

    private final long timeoutMs;

    public RiderClientService(RiderDetailsServiceGrpc.RiderDetailsServiceBlockingStub riderStub,
                              @Value("${rider.grpc.timeout-ms:2000}") long timeoutMs) {
        this.riderStub = riderStub;
        this.timeoutMs = timeoutMs;
    }

    public RiderDto getRiderDetailsByEmail(String riderEmail) {
        log.info("Requesting rider details for email={}", riderEmail);
        var request = RiderDetailsRequest.newBuilder().setRiderEmail(riderEmail).build();
        try {
            System.out.println("calling rider grpc");
            var response = riderStub.withDeadlineAfter(timeoutMs, TimeUnit.MILLISECONDS).getRiderDetails(request);
            log.info("Received rider details for email={} name={}", riderEmail, response.getRiderName());
            return new RiderDto(
                    response.getRiderName(),
                    response.getRiderPhone(),
                    response.getRiderImage(),
                    response.getVehicleNo(),
                    response.getDeliveryCount(),
                    response.getRating()
            );
        } catch (StatusRuntimeException e) {
            Status.Code code = e.getStatus().getCode();
            log.warn("gRPC call to RiderDetailsService failed: code={}, desc={}", code, e.getStatus().getDescription());
            // Log full exception stack at debug level to aid diagnosis without noisy logs in production
            log.debug("Full gRPC exception for riderEmail={}", riderEmail, e);
            if (code == Status.Code.NOT_FOUND) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rider not found");
            } else if (code == Status.Code.UNAVAILABLE || code == Status.Code.DEADLINE_EXCEEDED) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Rider service unavailable");
            } else if (code == Status.Code.PERMISSION_DENIED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to fetch rider details");
            } else if (code == Status.Code.UNAUTHENTICATED) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated to rider service");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to fetch rider details");
        } catch (Exception ex) {
            log.error("Unexpected error calling rider service", ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        }
    }
}
