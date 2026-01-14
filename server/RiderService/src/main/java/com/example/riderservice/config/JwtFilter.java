package com.example.riderservice.config;

import com.example.riderservice.service.authDetailService;
import com.example.riderservice.utility.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
public class JwtFilter extends OncePerRequestFilter {

    private  final JWTService jwtService;

    private final ApplicationContext context;


    public JwtFilter(JWTService jwtService, ApplicationContext context) {
        this.jwtService = jwtService;
        this.context = context;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();

        // 🚨 VERY IMPORTANT
        if (path.equals("/api/auth/refresh") ||
                path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/send-email-otp") ||
                path.equals("/api/auth/verify-email-otp") ||
                path.equals("/api/auth/resend-email-otp") ||
                path.startsWith("/api/forgot-password") ||
                path.startsWith("/api/reset-password")
//                path.startsWith("/ws")
        ) {
            System.out.println("Skipping JWT filter for path: " + path);
            filterChain.doFilter(request, response);
            return;
        }




        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;


        if(request.getCookies() != null){
           for(Cookie cookie : request.getCookies()){
               if("accessToken".equals(cookie.getName())){
                   token = cookie.getValue();
                   username = jwtService.extractUserName(token);
               }
           }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = context.getBean(authDetailService.class).loadUserByUsername(username);
            if (jwtService.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource()
                        .buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}