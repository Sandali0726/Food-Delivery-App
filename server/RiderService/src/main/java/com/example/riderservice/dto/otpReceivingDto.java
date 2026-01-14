package com.example.riderservice.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class otpReceivingDto {

    @Email(message = "Email should be valid")
    @NotNull(message = "Email cannot be null")
    private String email;
    @NotNull(message = "OTP cannot be null")
    @Length(min = 6, max = 6, message = "OTP must be 6 characters long")
    private String otp;
    private String timestamp;
}
