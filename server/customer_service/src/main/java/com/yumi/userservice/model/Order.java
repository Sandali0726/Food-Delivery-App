package com.yumi.userservice.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;
@Data
@EqualsAndHashCode(exclude = "orderItems")
@Entity
@Table(name="t_order")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;
     private int otp;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    @JsonManagedReference

    private List<OrderItem> orderItems;
    @Column(nullable = false)
    private String customerEmail;
    @Column(nullable = false)
    private String restaurantEmail;
    @Column(nullable = false)
    private String restaurantName;
    private String riderEmail;

    private double orderPrice;

    private double deliveryPrice;
    @Column(nullable = false )
    private double deliveryLat;
    @Column(nullable = false)
    private double deliveryLng;

    private String address;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

//    private Float deliver_lat;
//    private Float deliver_lng;
    @PrePersist
    protected void onCreate(){
        createdAt=LocalDateTime.now();
        updatedAt=LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate(){
        updatedAt=LocalDateTime.now();
    }

    public enum Status{
        CONFIRM,
        CANCEL,
        ACCEPTED,
        PREPARING,
        READY,
        RIDER_ASSIGNED,
        GO_TO_PICKUP,
        PICKED_UP,
        ON_THE_WAY,
        DELIVERED,
    }
}
