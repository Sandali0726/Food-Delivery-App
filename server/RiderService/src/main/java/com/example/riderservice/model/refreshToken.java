package com.example.riderservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "t_refresh_token")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class refreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(nullable = false)
    private String email;
    @Column(nullable = false)
    private String token;
    @Column(nullable = false)
    private Instant expiresAt;
    @Column(nullable = false)
    private boolean revoked;
    @Column(nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
