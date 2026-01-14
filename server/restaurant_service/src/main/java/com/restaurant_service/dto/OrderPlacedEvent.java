package com.restaurant_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderPlacedEvent {
    private Long orderId;
    private String restaurantEmail;
    private List<OrderItem> orderItems;
    private String customerEmail;
    private double orderPrice;
    private double deliveryLat;
    private double deliveryLng;
    private String address;
    private Integer otp;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItem {
        private Long foodId;
        private String itemName;
        private int quantity;
        private double price;
    }
}

