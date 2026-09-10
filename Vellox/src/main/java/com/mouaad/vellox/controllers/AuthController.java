package com.mouaad.vellox.controllers;

import com.mouaad.vellox.dtos.*;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
@AllArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;


    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.registerLocalUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse(
                                    "User registered successfully. " +
                                            "Please check your email for the verification code.", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        try {
            authService.verifyEmail(request.getEmail(), request.getCode());

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(new ApiResponse("Email verified successfully. You can now log in.", true));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest request) {
        try {
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

            // 4. Return the token to the React frontend
            return ResponseEntity.ok(new AuthResponse(jwtToken));

        } catch (BadCredentialsException e) {
            // Thrown if the password doesn't match the BCrypt hash in the database
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("Invalid email/username or password.", false));

        } catch (DisabledException e) {
            // Thrown because we set .disabled(!user.isVerified()) in CustomUserDetailsService
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse("Please verify your email address before logging in.", false));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Authentication failed.", false));
        }
    }
}
