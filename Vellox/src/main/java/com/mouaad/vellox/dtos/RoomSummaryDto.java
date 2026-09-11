package com.mouaad.vellox.dtos;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomSummaryDto {
    private UUID id;
    private String name;
    private String roomCode;
    private String role;
    private String ownerUsername;
}
