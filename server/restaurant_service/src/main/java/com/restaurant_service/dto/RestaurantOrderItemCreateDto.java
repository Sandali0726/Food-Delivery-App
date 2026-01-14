package com.restaurant_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantOrderItemCreateDto {

    @NotNull
    private Long orderId;

    @NotNull
    private Long foodId;

    @NotBlank
    private String foodName;

    @Min(1)
    private int quantity;

    @NotNull
    private BigDecimal price;

}
