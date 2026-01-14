package com.restaurant_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantOrderCreateDto {

    @NotNull
    private Long orderId; // previously UUID from customer service — now numeric

    @NotNull
    private String customerId;

    @NotBlank
    private String restaurantEmail;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal totalAmount;

    private Integer otp;
    private Double dropLat;
    private Double dropLng;
    private String dropAddress;

}
