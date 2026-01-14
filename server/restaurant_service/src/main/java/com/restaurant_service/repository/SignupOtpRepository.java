package com.restaurant_service.repository;

import com.restaurant_service.model.SignupOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SignupOtpRepository extends JpaRepository<SignupOtp, String> {
    Optional<SignupOtp> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
}

