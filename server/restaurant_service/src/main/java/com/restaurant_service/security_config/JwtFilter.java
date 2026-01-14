package com.restaurant_service.security_config;

import com.restaurant_service.service.CustomUserDetailsService;
import com.restaurant_service.service.RefreshTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtConfig jwtConfig;
    private final CustomUserDetailsService userDetailsService;
    private final RefreshTokenService refreshTokenService;

    public JwtFilter(JwtConfig jwtConfig, CustomUserDetailsService userDetailsService, RefreshTokenService refreshTokenService) {
        this.jwtConfig = jwtConfig;
        this.userDetailsService = userDetailsService;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        // Skip JWT validation for auth endpoints
        // Normalize the path (remove context path) and skip JWT validation for auth endpoints
        String servletPath = path;
        String context = request.getContextPath();
        if (context != null && !context.isBlank() && path.startsWith(context)) {
            servletPath = path.substring(context.length());
        }

        // Treat all /api/auth/* endpoints as public (registration, verification, resend, login, refresh)
        if (    servletPath.equals("/api/auth/login") ||
                servletPath.equals("/api/auth/register") ||
                servletPath.equals("/api/auth/refresh") ||
                servletPath.equals("/api/auth/verify-otp") ||
                servletPath.equals("/api/auth/resend-otp") ||
                servletPath.equals("/api/auth/forgot-password") ||
                servletPath.equals("/api/auth/reset-password")) {
            System.out.println("Skipping JWT validation for auth endpoint: " + servletPath);
            chain.doFilter(request, response);
            return;
        }

        // Allow preflight requests to pass through without authentication
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String token = null;

        // Try cookie first
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("ACCESS_TOKEN".equals(cookie.getName())) {
                    token = cookie.getValue();
                }
            }
        }

        // Fallback to Authorization header if cookie not present
        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                logger.debug("Found token, attempting to extract username");
                String email = jwtConfig.extractUsername(token);
                logger.debug("Token username extracted: {}", email);

                UserDetails user = userDetailsService.loadUserByUsername(email);
                if (user == null) {
                    // If the token contains an email that does not exist in the DB, don't
                    // send a 401 here. Allow the request to continue so that permitAll
                    // endpoints (e.g. registration) remain accessible. If the endpoint
                    // requires authentication, Spring Security will reject the request later.
                    logger.warn("No UserDetails found for email={} — continuing filter chain as anonymous", email);
                    chain.doFilter(request, response);
                    return;
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(auth);
                logger.debug("Authentication set for user={}", email);

                chain.doFilter(request, response);
            } catch (UsernameNotFoundException unfe) {
                // Specific case: user not found. Log and continue as anonymous so
                // permitAll endpoints are not blocked. Protected endpoints will be
                // handled by Spring Security.
                logger.warn("User not found while processing token: {}", unfe.getMessage());
                chain.doFilter(request, response);
                return;
            } catch (Exception e) {
                // If parsing failed (possibly expired token), attempt to refresh using refresh cookie
                logger.debug("Access token invalid or expired: attempting silent refresh if refresh cookie present");
                try {
                    String refresh = null;
                    if (request.getCookies() != null) {
                        for (Cookie cookie : request.getCookies()) {
                            if ("REFRESH_TOKEN".equals(cookie.getName())) {
                                refresh = cookie.getValue();
                            }
                        }
                    }

                    if (refresh != null && !refresh.isBlank()) {
                        String email = jwtConfig.extractUsername(refresh);
                        var stored = refreshTokenService.validate(refresh, email);

                        // Revoke old and issue new refresh token
                        refreshTokenService.revoke(stored);
                        String newAccess = jwtConfig.generateAccessToken(email, "RESTUARANT");
                        String newRefresh = jwtConfig.generateRefreshToken(email, "RESTUARANT");

                        refreshTokenService.save(newRefresh, email, LocalDateTime.now().plusDays(2));

                        // set cookies on response (same attributes used by Auth_Service)
                        // Build cookies explicitly so SameSite, httpOnly, path and maxAge match the Auth_Service behavior
                        org.springframework.http.ResponseCookie accessCookie = org.springframework.http.ResponseCookie.from("ACCESS_TOKEN", newAccess)
                                .httpOnly(true)
                                .secure(false)
                                .sameSite("Lax")
                                .path("/")
                                .maxAge(15L * 60L)
                                .build();

                        org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from("REFRESH_TOKEN", newRefresh)
                                .httpOnly(true)
                                .secure(false)
                                .sameSite("Lax")
                                .path("/")
                                .maxAge(2L * 24L * 60L * 60L)
                                .build();

                        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, accessCookie.toString());
                        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString());

                        // set authentication for current request
                        UserDetails user = userDetailsService.loadUserByUsername(email);
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);

                        chain.doFilter(request, response);
                        return;
                    }

                } catch (Exception ex) {
                    logger.warn("Silent refresh failed: {}", ex.getMessage());
                }

                // Let refresh endpoint proceed even if access token is invalid
                chain.doFilter(request, response);
            }
        } else {
            // no token present or authentication already set
            chain.doFilter(request, response);
        }
    }

}
