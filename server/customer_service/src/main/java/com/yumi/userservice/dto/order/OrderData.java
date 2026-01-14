package com.yumi.userservice.dto.order;

import com.yumi.userservice.model.Order;
import com.yumi.userservice.model.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class OrderData {
    private Long orderId;
    private int otp;
    private List<OrderItem> orderItems;
    private String customerEmail;
    private String restaurantEmail;
    private String restaurantName;
    private double orderPrice;
    private double deliveryPrice;
    private double deliveryLat;
    private double deliveryLng;
    private String riderEmail;
    private String address;
    private Order.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
