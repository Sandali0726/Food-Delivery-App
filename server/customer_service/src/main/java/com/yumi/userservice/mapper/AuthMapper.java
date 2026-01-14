package com.yumi.userservice.mapper;

import com.yumi.userservice.dto.Authdto.*;
import com.yumi.userservice.model.Auth;
import org.mapstruct.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    // Map SignupRequest → Auth, including authProvider, email and password
    @Mapping(target = "authProvider", constant = "LOCAL")
    @Mapping(target = "email", source = "auth_email")
    @Mapping(target = "password", expression = "java(passwordEncoder.encode(dto.getPassword()))")
    Auth toEntity(SignupRequest dto, @Context PasswordEncoder passwordEncoder);

    // Map Google login DTO → Auth
    @Mapping(target = "authProvider", constant = "GOOGLE")
    @Mapping(target = "password", ignore = true)
    Auth toEntity(GoogleLoginRequestDto dto);

}
