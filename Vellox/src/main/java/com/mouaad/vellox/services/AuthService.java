package com.mouaad.vellox.services;

import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.entities.VerificationCode;
import com.mouaad.vellox.repositories.UserRepository;
import com.mouaad.vellox.repositories.VerificationCodeRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public User registerLocalUser(String username, String email, String rawPassword) {
        //1. Validate Uniqueness
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        // 2. Build and Save the User
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);

        newUser.setPasswordHash(passwordEncoder.encode(rawPassword));
        newUser.setAuthProvider("LOCAL");
        newUser.setVerified(false);

        User savedUser = userRepository.save(newUser);
        // 3. Generate and Save the Verification Code
        String code = generateSixDigitsCode();

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setUser(savedUser);
        verificationCode.setCode(code);
        // Code expires in 15 minutes for security
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        verificationCodeRepository.save(verificationCode);

        //4.Trigger Email Sending here
        emailService.sendVerificationEmail(savedUser.getEmail(), code);

        return savedUser;
    }

    @Transactional
    public void verifyEmail(String email, String code) {
        //1. find the user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with this email ."));
        // 2. If the user is already verified, no need to proceed
        if (user.isVerified()) {
            throw new IllegalArgumentException("Account already verified");
        }
        // 3. Find the specific, unused verification code for this user
        VerificationCode verificationCode = verificationCodeRepository.findByCodeAndUserAndConsumedFalse(code, user)
                .orElseThrow(() -> new IllegalArgumentException("Verification code not found"));

        // 4. Check if the code has expired
        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code expired. Please enter a new one .");
        }
        // 5. Update states: Mark code as consumed and user as verified
        verificationCode.setConsumed(true);
        user.setVerified(true);
        // 6. Save the changes to the database
        verificationCodeRepository.save(verificationCode);
        userRepository.save(user);
    }


    private String generateSixDigitsCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}