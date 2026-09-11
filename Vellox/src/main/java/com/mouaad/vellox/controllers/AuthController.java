package com.mouaad.vellox.controllers;

import com.mouaad.vellox.dtos.*;
import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.repositories.UserRepository;
import com.mouaad.vellox.security.CustomUserDetailsService;
import com.mouaad.vellox.security.JwtService;
import com.mouaad.vellox.services.AuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        authService.registerLocalUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("User registered successfully. Please check your email for the verification code.", true));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.getEmail(), request.getCode());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new ApiResponse("Email verified successfully. You can now log in.", true));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest request) {
        // 1. Delegate password checking to Spring Security's AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getIdentifier(),
                        request.getPassword()
                )
        );
        // 2. If authentication succeeds, load the user details (which contains the UUID as the subject)
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getIdentifier());

        // 3. Generate the JWT token
        String jwtToken = jwtService.generateToken(userDetails);

        // 4. Look up user details to send to React frontend
        UUID userId = UUID.fromString(userDetails.getUsername());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 5. Return the token and user summary to the React frontend
        return ResponseEntity.ok(new AuthResponse(jwtToken, UserSummaryDto.fromEntity(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("Unauthorized", false));
        }
        UUID userId = UUID.fromString(principal.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(UserSummaryDto.fromEntity(user));
    }
}
