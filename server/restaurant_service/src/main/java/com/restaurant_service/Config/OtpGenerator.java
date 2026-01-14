package com.restaurant_service.Config;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpGenerator {

    public String generateOtp() {
        return String.valueOf(
                100000 + new SecureRandom().nextInt(900000)
        ); // 6-digit
    }
}
