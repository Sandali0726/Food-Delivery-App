package com.example.riderservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class profileDto {

    private String email;
    private String first_name;
    private String last_name;
    private String phone_number;
    private String address;
    private String img_url;
    private String licence;
    private String vehicle_no;
    private BigDecimal rating;
    private LocalDateTime created_at;


}
