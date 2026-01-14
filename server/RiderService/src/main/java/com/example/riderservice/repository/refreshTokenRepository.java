package com.example.riderservice.repository;

import com.example.riderservice.model.refreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.Instant;
import java.util.Optional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface refreshTokenRepository extends JpaRepository<refreshToken, UUID> {


    List<refreshToken> findByEmailAndRevokedFalse(String email);

    Optional<refreshToken> findByEmailAndRevokedFalseAndExpiresAtAfter(String email, Instant now);

    @Modifying
    @Query("UPDATE refreshToken r SET r.revoked=true WHERE r.email = :email")
    void revokeAllByEmail(@Param("email") String email);
}
