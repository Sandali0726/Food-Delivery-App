package com.example.riderservice.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="x_password_otp")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class passwordOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(nullable = false)
    private String email;
    @Column(nullable = false)
    private String otp;
    @Column(nullable = false)
    private LocalDateTime timestamp;
    @Column(nullable = false)
    @Builder.Default
    private int attempts = 0;

}
