package com.restaurant_service.dto;

import com.restaurant_service.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantOrderResponseDto {
    private Long orderId;
    private String customerId;
    private String restaurantEmail;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Double dropLat;
    private Double dropLng;
    private String dropAddress;
    private String customerName;
    private String customerPhone;
    private Integer otp;

}
