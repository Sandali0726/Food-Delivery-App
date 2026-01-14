package com.yumi.userservice.config;

import com.yumi.userservice.dto.Authdto.GoogleLoginRequestDto;
import com.yumi.userservice.dto.Authdto.LoginResponse;
import com.yumi.userservice.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private AuthService authService;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null || email.isEmpty()) {
            response.sendRedirect("http://localhost:3000/login?error=email_not_found");
            return;
        }

        // Wrap email into DTO
        GoogleLoginRequestDto dto = new GoogleLoginRequestDto();
        dto.setEmail(email);

        LoginResponse result = authService.loginOrSignupGoogle(dto); // mapper-driven

        // Redirect to frontend with token, email and newUser flag
        String redirectUrl = String.format(
                "http://localhost:3000/oauth2/callback?token=%s&email=%s&newUser=%s",
                result.getToken(), email, result.isNewUser()
        );

        response.sendRedirect(redirectUrl);
    }
}
