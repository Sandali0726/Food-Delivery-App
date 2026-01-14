package com.restaurant_service.dto;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantOrderItemResponseDto {

    private UUID orderItemId;
    private Long orderId;
    private Long foodId;
    private String foodName;
    private int quantity;
    private BigDecimal price;

}
