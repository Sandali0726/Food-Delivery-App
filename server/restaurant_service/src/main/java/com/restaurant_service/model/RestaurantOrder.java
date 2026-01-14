package com.restaurant_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "t_restaurant_orders")
public class RestaurantOrder {

    @Id
    @Column(name = "order_id")
    private Long orderId; // switched from UUID to Long (numeric PK)

    @Column(name = "customer_id")
    private String customerId;

    @Column(name = "restaurant_email", nullable = false)
    private String restaurantEmail;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.NEW;

    @Column(name = "drop_lat")
    private Double dropLat;

    @Column(name = "drop_lng")
    private Double dropLng;

    @Column(name = "drop_address", columnDefinition = "TEXT")
    private String dropAddress;

    @Column(name="otp",nullable = true)
    private Integer otp;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

}
