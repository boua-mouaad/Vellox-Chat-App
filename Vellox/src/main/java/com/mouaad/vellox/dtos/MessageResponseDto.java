package com.mouaad.vellox.dtos;

import com.mouaad.vellox.entities.Message;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageResponseDto {
    private UUID id;
    private String content;
    private UUID senderId;
    private String senderUsername;
    private UUID receiverId;
    private UUID roomId;
    private LocalDateTime createdAt;

    public static MessageResponseDto fromEntity(Message message) {
        if (message == null) {
            return null;
        }

        return MessageResponseDto.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .senderUsername(message.getSender() != null ? message.getSender().getUsername() : null)
                .receiverId(message.getReceiver() != null ? message.getReceiver().getId() : null)
                .roomId(message.getRoom() != null ? message.getRoom().getId() : null)
                .createdAt(message.getCreatedAt())
                .build();
    }
}
