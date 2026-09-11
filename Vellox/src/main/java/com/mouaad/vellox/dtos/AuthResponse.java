package com.mouaad.vellox.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UserSummaryDto user;

    public AuthResponse(String token) {
        this.token = token;
        this.type = "Bearer";
    }

    public AuthResponse(String token, UserSummaryDto user) {
        this.token = token;
        this.type = "Bearer";
        this.user = user;
    }
}
