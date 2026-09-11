package com.mouaad.vellox.dtos;

import com.mouaad.vellox.entities.User;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserSummaryDto {
    private UUID id;
    private String username;
    private String email;

    public static UserSummaryDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}
