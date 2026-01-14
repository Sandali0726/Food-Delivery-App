package com.restaurant_service.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;


@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String toEmail, String otp) {
        sendOtp(toEmail, otp, "Password Reset OTP");
    }

    public void sendOtp(String toEmail, String otp, String subject) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(
                "Your OTP is: " + otp +
                        "\n\nThis OTP will expire in 10 minutes."
        );

        mailSender.send(message);
    }
}
