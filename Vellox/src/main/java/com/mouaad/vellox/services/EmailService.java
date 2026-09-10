package com.mouaad.vellox.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    @Async
    public void sendVerificationEmail(String toEmail, String code) {
        // 1. Create a simple text-based email
        SimpleMailMessage message = new SimpleMailMessage();
        // 2. Build the email envelope
        message.setTo(toEmail);
        message.setSubject("ChatApp - Verify Your Email");
        // 3. Construct the email body
        message.setText("Welcome to ChatApp!\n\n" +
                "Your verification code is: " + code + "\n\n" +
                "This code will expire in 15 minutes.\n" +
                "If you did not request this, please ignore this email.");

        // 4. Dispatch the email via SMTP
        mailSender.send(message);
    }
}
