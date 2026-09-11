package com.mouaad.vellox.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class CreateRoomRequest {
    @NotBlank(message = "Room name cannot be blank.")
    @Size(min = 3, max = 64, message = "Room name must be between 3 and 64 characters.")
    private String roomName;
}
