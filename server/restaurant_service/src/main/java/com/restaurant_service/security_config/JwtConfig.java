package com.restaurant_service.security_config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;

@Component
public class JwtConfig {

    private final String secretKey  ;
    // ACCESS_TOKEN = 15 minutes (ms)
    private static final long ACCESS_TOKEN_VALIDITY_SECONDS = 15L * 60L * 1000L;
    // REFRESH_TOKEN = 2 days (ms)
    private static final long REFRESH_TOKEN_VALIDITY_SECONDS = 2L * 24L * 60L * 60L * 1000L;

    private static final Logger log = LoggerFactory.getLogger(JwtConfig.class);

    public JwtConfig(@Value("${jwt.secret}") String secretKey) {
        this.secretKey = secretKey;
    }

    public String generateAccessToken(String email,String role) {
        return generateToken(role,email, ACCESS_TOKEN_VALIDITY_SECONDS);
    }

    public String generateRefreshToken(String email,String role) {
        return generateToken(role,email, REFRESH_TOKEN_VALIDITY_SECONDS);
    }

    private String generateToken(String role,String subject, long exp) {
        return Jwts.builder()
                .setSubject(subject)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + exp))
                .signWith(
                        Keys.hmacShaKeyFor(secretKey.getBytes()),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }
    public String extractUsername(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey.getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            log.warn("Failed to parse JWT token: {}", e.getMessage());
            throw e;
        }
    }


}
