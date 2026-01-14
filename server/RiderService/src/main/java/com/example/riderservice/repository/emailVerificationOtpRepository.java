package com.example.riderservice.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.Optional;
import com.example.riderservice.model.emailVerificationOtp;


public interface emailVerificationOtpRepository extends JpaRepository<emailVerificationOtp, UUID> {
    boolean existsByEmailAndVerifiedTrue(String email);

    void deleteByEmail(String email);

    Optional<emailVerificationOtp> findByEmail(String email);
}



