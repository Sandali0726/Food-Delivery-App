package com.example.riderservice.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "x_order")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class order {

    @Id
    private Long orderId;
    private String restaurantEmail;
    private String customerEmail;
    private int otp;
    private float orderPrice;
    private float pickupLat;
    private float pickupLng;
    private float dropLat;
    private float dropLng;
    private LocalDateTime createdAt;



}
