package com.mouaad.vellox.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FriendRequestDto {
    @NotBlank(message = "Target username is required.")
    private String targetUsername;

}
