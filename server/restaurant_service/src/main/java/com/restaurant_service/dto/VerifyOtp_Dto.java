package com.restaurant_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerifyOtp_Dto {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String otp;
}

