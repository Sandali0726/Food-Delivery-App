package com.example.riderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.riderservice.model.auth;

import java.util.Optional;

public interface authRepository extends JpaRepository<auth,String> {

    Optional<auth> findByEmail(String email);
}
