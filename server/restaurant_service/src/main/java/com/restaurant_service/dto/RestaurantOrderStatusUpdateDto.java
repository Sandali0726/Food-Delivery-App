package com.restaurant_service.dto;

import com.restaurant_service.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantOrderStatusUpdateDto {

    @NotNull
    private OrderStatus status;

}

