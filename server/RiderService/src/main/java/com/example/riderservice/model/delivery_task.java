package com.example.riderservice.model;

import com.example.riderservice.enums.Delivery_status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "t_delivery_task")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class delivery_task {
    @Id
    @GeneratedValue(generator = "uuid2")
    @Column(name = "delivery_id")
    private UUID deliveryId;
    @Column(name = "order_id")
    private Long orderId;
    @Column(name = "restaurant_id")
    private String restaurantId;
    @Column(name = "customer_email")
    private String customerEmail;
    private float order_price;
    @Column(name = "delivery_price")
    private float deliveryPrice;
    private float pickup_lat;
    private float pickup_lng;
    private float drop_lat;
    private float drop_lng;
    @Enumerated(EnumType.STRING)
    private Delivery_status status;
    private Long otp_number;
    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
    @Column(name = "picked_at")
    private LocalDateTime pickedAt;
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;


    @ManyToOne
    @JoinColumn(name = "email")
    private rider rider;

}
