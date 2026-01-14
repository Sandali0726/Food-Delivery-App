package com.example.riderservice.utility;

import java.security.SecureRandom;

public class otpGenerator {

    public static String generateOtp() {
        SecureRandom random = new SecureRandom();
        return String.valueOf(random.nextInt(900000) + 100000);
    }
}
