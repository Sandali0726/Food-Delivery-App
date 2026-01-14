package com.restaurant_service.model;

import com.restaurant_service.enums.DeliveryRequestStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "delivery_request_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryRequestLog {

    @Id
    @Column(name = "request_id", nullable = false, updatable = false)
    private UUID requestId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "restaurant_email", nullable = false)
    private String restaurantEmail;

    @Column(name="client_id",nullable = false)
    private String clientId;

    @Column(name = "pickup_lat")
    private BigDecimal pickupLat;

    @Column(name = "pickup_lng")
    private BigDecimal pickupLng;

    @Column(name = "drop_lat")
    private Double dropLat;

    @Column(name = "drop_lng")
    private Double dropLng;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DeliveryRequestStatus status;

    @Column(name = "delivery_id")
    private String deliveryId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name="price",nullable = false)
    private BigDecimal price;

    @Column(name="otp",nullable = true)
    private Integer otp;

    @PrePersist
    public void prePersist() {
        if (this.requestId == null) this.requestId = UUID.randomUUID();
        if (this.createdAt == null) this.createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
