package com.yumi.userservice.dto.Authdto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonAlias;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class LoginRequestDto {
    @Email(message="Invalid email format")
    @NotBlank(message="Email is required")
    @JsonAlias({"email", "auth_email"})
    private String auth_email;
    private String password;
}