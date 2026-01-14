package com.example.riderservice.service;

import com.example.riderservice.model.refreshToken;
import com.example.riderservice.repository.refreshTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class refreshTokenService {


    private final refreshTokenRepository repo;
    private final PasswordEncoder encoder;

    public refreshTokenService(refreshTokenRepository repo,
                               PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public void save(String rawToken, String email, Instant expiry) {
        refreshToken token = new refreshToken();
        token.setEmail(email);
        // Store JWT tokens directly without BCrypt encoding 
        // JWT tokens are already secure and too long for BCrypt (72-byte limit)
        token.setToken(rawToken);
        token.setExpiresAt(expiry);
        repo.save(token);
    }

    public refreshToken validate(String rawToken, String email) {
        List<refreshToken> tokens =
                repo.findByEmailAndRevokedFalse(email);

        for (refreshToken token : tokens) {
            // Use direct string comparison since we're no longer hashing JWT tokens
            if (rawToken.equals(token.getToken())) {
                if (token.getExpiresAt().isBefore(Instant.now())) {
                    token.setRevoked(true);
                    throw new RuntimeException("Refresh token expired");
                }
                return token;
            }
        }
        throw new RuntimeException("Invalid refresh token");
    }

    public void revokeAll(String email) {
        repo.revokeAllByEmail(email);
    }

}
