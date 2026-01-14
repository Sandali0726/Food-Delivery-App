package com.yumi.userservice.repository;

import com.yumi.userservice.model.OTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByEmailAndPurpose(String email, OTP.Purpose purpose);
}
