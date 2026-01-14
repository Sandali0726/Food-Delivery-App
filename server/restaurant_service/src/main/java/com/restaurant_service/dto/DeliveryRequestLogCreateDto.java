package com.restaurant_service.dto;

import com.restaurant_service.enums.DeliveryRequestStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryRequestLogCreateDto {

    @NotNull
    private Long orderId;

    @NotNull
    @Email
    private String restaurantEmail;

    @NotNull
    private String clientId;

    @NotNull
    private BigDecimal pickupLat;

    @NotNull
    private BigDecimal pickupLng;

    @NotNull
    private BigDecimal price;

    @NotNull
    private Double dropLat;

    @NotNull
    private Double dropLng;

    private DeliveryRequestStatus status;

    private String deliveryId;

    private Integer otp;
}
