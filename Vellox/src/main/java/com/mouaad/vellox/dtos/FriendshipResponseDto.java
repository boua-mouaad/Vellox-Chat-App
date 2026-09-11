package com.mouaad.vellox.dtos;

import com.mouaad.vellox.entities.Friendship;
import com.mouaad.vellox.entities.FriendshipStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FriendshipResponseDto {
    private UUID id;
    private UserSummaryDto requester;
    private UserSummaryDto addressee;
    private FriendshipStatus status;
    private LocalDateTime createdAt;

    public static FriendshipResponseDto fromEntity(Friendship friendship) {
        if (friendship == null) {
            return null;
        }
        return FriendshipResponseDto.builder()
                .id(friendship.getId())
                .requester(UserSummaryDto.fromEntity(friendship.getRequester()))
                .addressee(UserSummaryDto.fromEntity(friendship.getAddressee()))
                .status(friendship.getStatus())
                .createdAt(friendship.getCreatedAt())
                .build();
    }
}
