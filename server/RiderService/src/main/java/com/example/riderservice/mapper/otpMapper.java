package com.example.riderservice.mapper;

import com.example.riderservice.dto.otpReceivingDto;
import com.example.riderservice.model.passwordOtp;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring" ,builder = @Builder(disableBuilder = true))
public interface otpMapper {

    passwordOtp toPasswordOtpEntity(String otp);
    otpReceivingDto toOtpReceivingDTO(passwordOtp entity);
}
