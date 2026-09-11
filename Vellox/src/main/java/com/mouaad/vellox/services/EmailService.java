package com.mouaad.vellox.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendVerificationEmail(String toEmail, String code) {
        log.info("==================================================");
        log.info(">>> VERIFICATION CODE for {}: [{}] <<<", toEmail, code);
        log.info("==================================================");

        try {
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
            log.info("Verification email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.warn("Could not dispatch SMTP email to {}: {}. (Use code from log in dev)", toEmail, e.getMessage());
        }
    }
}
