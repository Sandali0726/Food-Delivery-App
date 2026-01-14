package com.restaurant_service.dto;
import lombok.Data;

@Data
public class ChangePassword_Dto {
    private String oldPassword;
    private String newPassword;
}
