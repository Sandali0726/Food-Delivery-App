package com.example.riderservice.repository;

import com.example.riderservice.model.passwordOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface passwordOtpRepository extends JpaRepository<passwordOtp, UUID> {
    Optional<passwordOtp> findByEmail(String email);

    void deleteByEmail(String email);

}
