package com.yumi.userservice.repository;

import com.yumi.userservice.model.Auth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthRepository extends JpaRepository<Auth, String> {
    boolean existsByEmail(String auth_email);
}


