package com.example.riderservice.service;

import com.example.riderservice.model.auth;
import com.example.riderservice.model.authPrincipal;
import com.example.riderservice.repository.authRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class authDetailService implements UserDetailsService {

    private final authRepository repo;

    public authDetailService(authRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        System.out.println("Loading user by username: " + username);
        
        // In this application, username is actually the email
        auth user = repo.findByEmail(username)
                .orElseThrow(() -> {
                    System.out.println("User not found with email: " + username);
                    return new UsernameNotFoundException("User not found with email: " + username);
                });

        System.out.println("User found: " + user.getEmail());
        System.out.println("User password (hashed): " + user.getPassword());
        
        return new authPrincipal(user);
    }
}
