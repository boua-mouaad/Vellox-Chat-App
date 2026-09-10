package com.mouaad.vellox.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyEmailRequest {
    @NotBlank(message = "Email is required.")
    @Email(message = "Must be a valid email format.")
    private String email;

    @NotBlank(message = "Verification code is required.")
    // Ensures the code is exactly 6 digits using a Regular Expression
    @Pattern(regexp = "^\\d{6}$", message = "Verification code must be exactly 6 digits.")
    private String code;
}
