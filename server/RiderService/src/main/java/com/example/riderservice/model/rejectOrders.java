package com.example.riderservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "x_rejected_orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class rejectOrders {

    @Id
    @GeneratedValue(generator = "uuid2")
    UUID id;
    Long orderId;
    String email;
}
