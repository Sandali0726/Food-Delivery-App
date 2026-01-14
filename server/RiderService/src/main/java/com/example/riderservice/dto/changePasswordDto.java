package com.example.riderservice.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class changePasswordDto {

    private String email;
    private String oldPassword;
    private String newPassword;

}
