package com.mouaad.vellox.controllers;

import com.mouaad.vellox.dtos.ApiResponse;
import com.mouaad.vellox.entities.Message;
import com.mouaad.vellox.services.MessageService;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> getRoomChatHistory(
            @PathVariable("roomId") UUID roomId,
            Principal principal) {
        try {
            UUID userId = UUID.fromString(principal.getName());
            List<Message> history = messageService.getRoomMessages(userId, roomId);

            return ResponseEntity.ok(history);
        } catch (SecurityException e) {
            // Caught if the user tries to fetch messages for a room they aren't in
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(e.getMessage(), false));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }

    /**
     * Fetches the 1-on-1 private chat history with a specific friend.
     */
    @GetMapping("/private/{friendId}")
    public ResponseEntity<?> getPrivateChatHistory(
            @PathVariable("friendId") UUID friendId,
            Principal principal) {
        try {
            UUID userId = UUID.fromString(principal.getName());
            List<Message> history = messageService.getPrivateMessages(userId, friendId);

            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }
}
