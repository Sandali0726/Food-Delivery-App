package com.restaurant_service.service;

import com.restaurant_service.model.RefreshToken;
import com.restaurant_service.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    public void save(String rawToken, String email, LocalDateTime expiry) {

        // first revoke any existing active tokens for this user so we only ever keep one active
        List<RefreshToken> activeTokens =
                repo.findAllByUserEmailAndRevokedFalseOrderByExpiryDateDesc(email);
        if (!activeTokens.isEmpty()) {
            activeTokens.forEach(t -> t.setRevoked(true));
            repo.saveAll(activeTokens);
            log.debug("Revoked {} existing active refresh tokens for user={}", activeTokens.size(), email);
        }

        RefreshToken token = new RefreshToken();
        token.setTokenHash(hash(rawToken));
        token.setUserEmail(email);
        token.setExpiryDate(expiry);
        token.setRevoked(false);

        repo.save(token);

        // debug: confirm we stored a token for this user
        log.debug("Saved refresh token for user={} expiry={}", email, expiry);
    }

    public RefreshToken validate(String rawToken, String email) {

        log.debug("Validating refresh token for user={}", email);

        // fetch all active tokens for this user ordered by newest expiry first
        List<RefreshToken> activeTokens =
                repo.findAllByUserEmailAndRevokedFalseOrderByExpiryDateDesc(email);

        if (activeTokens.isEmpty()) {
            log.warn("No stored active refresh token found for user={}", email);
            throw new RuntimeException("Invalid refresh token");
        }

        // newest token is first
        RefreshToken stored = activeTokens.get(0);

        // if there are extra active tokens, revoke them as self-healing
        if (activeTokens.size() > 1) {
            activeTokens.subList(1, activeTokens.size())
                    .forEach(t -> t.setRevoked(true));
            repo.saveAll(activeTokens.subList(1, activeTokens.size()));
            log.warn("Found {} extra active refresh tokens for user={}, revoked them.",
                    activeTokens.size() - 1, email);
        }

        if (stored.getExpiryDate().isBefore(LocalDateTime.now())) {
            log.warn("Stored refresh token for user={} expired at {}", email, stored.getExpiryDate());
            throw new RuntimeException("Refresh token expired");
        }

        String rawHash = hash(rawToken);
        if (!rawHash.equals(stored.getTokenHash())) {
            // possible reuse or tampering: revoke all and surface a clear error
            log.warn("Refresh token hash mismatch for user={}. Possible token reuse or tampering.", email);
            revokeAll(email);
            throw new RuntimeException("Refresh token reuse detected");
        }

        log.debug("Refresh token validated successfully for user={}", email);
        return stored;
    }

    public void clearIfTampered(String rawToken) {
        try {
            String rawHash = hash(rawToken);
            repo.findByTokenHash(rawHash).ifPresent(token -> {
                token.setRevoked(true);
                repo.save(token);
                log.warn("Marked tampered refresh token as revoked for user={}", token.getUserEmail());
            });
        } catch (Exception ex) {
            log.warn("Failed to clear tampered refresh token: {}", ex.getMessage());
        }
    }

    public void revoke(RefreshToken token) {
        token.setRevoked(true);
        repo.save(token);
        log.debug("Revoked refresh token for user={}", token.getUserEmail());
    }

    public void revokeAll(String email) {
        repo.findAllByUserEmail(email)
                .forEach(t -> {
                    t.setRevoked(true);
                    repo.save(t);
                });
        log.debug("Revoked all refresh tokens for user={}", email);
    }

    private String hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is always available in Java; rethrow as runtime if somehow missing
            throw new RuntimeException(e);
        }
    }
}
