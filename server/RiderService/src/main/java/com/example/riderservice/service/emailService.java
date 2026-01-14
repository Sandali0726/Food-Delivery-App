package com.example.riderservice.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
public class emailService {


    private final JavaMailSender mailSender;

    public emailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");
        mailSender.send(message);
    }

    public void sendEmailVerificationOtp(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Email Verification OTP");
        message.setText("Welcome to Yumy!\n\nYour email verification OTP is: " + otp + "\n\nThis OTP is valid for 10 minutes.\n\nPlease verify your email to complete your registration.");
        mailSender.send(message);
    }

}
