package com.mouaad.vellox.dtos;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username cannot be blank.")
    @Size(min = 3, max = 32, message = "Username must be between 3 and 32 characters.")
    private String username;

    @NotBlank(message = "Email cannot be blank.")
    @Email(message = "Must be a valid email format.")
    private String email;

    @NotBlank(message = "Password cannot be blank.")
    @Size(min = 8, message = "Password must be at least 8 characters for security.")
    private String password;
}
