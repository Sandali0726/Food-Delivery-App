package com.example.riderservice.dto;

import com.example.riderservice.enums.Delivery_status;
import com.example.riderservice.model.orderItem;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class deliveryDetailsDto {

    private UUID deliveryId;
    private Long orderId;
    private List<orderItem> orderItems;
    private String restaurantId;
    private String restaurantName;
    private String restaurantPhone;
    private String customerEmail;
    private String customerName;
    private String customerPhone;
    private float order_price;
    private float deliveryPrice;
    private float pickup_lat;
    private float pickup_lng;
    private float drop_lat;
    private float drop_lng;
    private LocalDateTime acceptedAt;
    private LocalDateTime pickedAt;
    private LocalDateTime deliveredAt;
    @Enumerated(EnumType.STRING)
    private Delivery_status status;

}
