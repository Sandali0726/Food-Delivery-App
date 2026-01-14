package com.restaurant_service.service;

import com.restaurant_service.repository.Auth_Repository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final Auth_Repository auth_repository;

    public CustomUserDetailsService(Auth_Repository auth_repository) {
        this.auth_repository = auth_repository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        return auth_repository.findById(email)
                .orElseThrow(() -> new UsernameNotFoundException( "User not found with email: " + email));
    }

}
