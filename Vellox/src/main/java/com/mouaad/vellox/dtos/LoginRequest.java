package com.mouaad.vellox.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Email or username is required.")
    private String identifier;
    @NotBlank(message = "Password is required.")
    private String password;
}
