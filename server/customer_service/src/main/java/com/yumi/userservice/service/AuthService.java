package com.yumi.userservice.service;

import com.yumi.userservice.dto.Authdto.GoogleLoginRequestDto;
import com.yumi.userservice.dto.Authdto.LoginResponse;
import com.yumi.userservice.dto.Authdto.SignupRequest;
import com.yumi.userservice.mapper.AuthMapper;
import com.yumi.userservice.model.Auth;
import com.yumi.userservice.repository.AuthRepository;
import com.yumi.userservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthMapper authMapper;

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VerifyEmail verifyEmail;

    @Autowired
    private JwtUtil jwtUtil;

    public void signup(SignupRequest dto) {
        if(authRepository.existsByEmail(dto.getAuth_email())) {
            throw new RuntimeException("Email already exists");
        }

        Auth authUser = authMapper.toEntity(dto, passwordEncoder); // password encoding inside mapper
        authRepository.save(authUser);
        verifyEmail.sendVerificationOtp(dto.getAuth_email());
    }

    // ================= LOGIN =================
    public String login(String email, String password){
        Auth authUser = authRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("User not have account. Please sign up first."));

        if(!passwordEncoder.matches(password, authUser.getPassword())){
            throw new RuntimeException("Invalid password");
        }

        // Generate and return real JWT token
        return jwtUtil.generateToken(email);
    }

    // ================= GOOGLE OAUTH =================
    public LoginResponse loginOrSignupGoogle(GoogleLoginRequestDto dto) {
        String email = dto.getEmail();
        boolean existed = authRepository.existsById(email);

        if(!existed) {
            Auth user = authMapper.toEntity(dto); // mapper sets authProvider="GOOGLE"
            authRepository.save(user);
        }

        String token = jwtUtil.generateToken(email);
        return new LoginResponse(token, !existed);
    }
}
