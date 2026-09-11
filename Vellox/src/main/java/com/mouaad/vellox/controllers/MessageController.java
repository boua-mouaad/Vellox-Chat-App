package com.mouaad.vellox.controllers;

import com.mouaad.vellox.dtos.MessageResponseDto;
import com.mouaad.vellox.services.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * Fetches the entire chat history for a specific group room.
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<MessageResponseDto>> getRoomChatHistory(
            @PathVariable("roomId") UUID roomId,
            Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        List<MessageResponseDto> history = messageService.getRoomMessages(userId, roomId);
        return ResponseEntity.ok(history);
    }

    /**
     * Fetches the 1-on-1 private chat history with a specific friend.
     */
    @GetMapping("/private/{friendId}")
    public ResponseEntity<List<MessageResponseDto>> getPrivateChatHistory(
            @PathVariable("friendId") UUID friendId,
            Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        List<MessageResponseDto> history = messageService.getPrivateMessages(userId, friendId);
        return ResponseEntity.ok(history);
    }
}
