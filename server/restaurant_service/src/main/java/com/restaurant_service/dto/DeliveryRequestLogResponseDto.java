package com.restaurant_service.dto;

import com.restaurant_service.enums.DeliveryRequestStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryRequestLogResponseDto {

    private UUID requestId;
    private Long orderId;
    private String restaurantEmail;
    private String clientId;
    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private Double dropLat;
    private Double dropLng;
    private DeliveryRequestStatus status;
    private String deliveryId;
    private Instant createdAt;
    private Instant updatedAt;
    private BigDecimal price;
    private Integer otp;
}
