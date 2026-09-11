package com.mouaad.vellox.controllers;

import com.mouaad.vellox.dtos.LiveMessagePayload;
import com.mouaad.vellox.dtos.MessageResponseDto;
import com.mouaad.vellox.services.MessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

/**
 * Handles all real-time WebSocket message routing and broadcasting.
 */
@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    /**
     * Handles group room messages.
     * React sends to: /app/chat.room.{roomId}
     */
    @MessageMapping("/chat.room/{roomId}")
    public void processRoomMessage(
            @DestinationVariable("roomId") UUID roomId,
            @Payload LiveMessagePayload payload,
            Principal principal) {

        try {
            UUID senderId = UUID.fromString(principal.getName());

            // 1. Save the message to the PostgreSQL database via our secure service
            MessageResponseDto savedMessage = messageService.saveRoomMessage(senderId, roomId, payload.getContent());

            // 2. Broadcast the saved message DTO to everyone subscribed to this room's topic
            // React listens on: /topic/room/{roomId}
            messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);

        } catch (Exception e) {
            System.err.println("Failed to process room message: " + e.getMessage());
        }
    }

    /**
     * Handles private 1-on-1 messages.
     * React sends to: /app/chat.private
     */
    @MessageMapping("/chat.private")
    public void processPrivateMessage(
            @Payload LiveMessagePayload payload,
            Principal principal) {

        try {
            UUID senderId = UUID.fromString(principal.getName());
            UUID receiverId = payload.getTargetId();

            // 1. Save the private message to the database
            MessageResponseDto savedMessage = messageService.savePrivateMessage(senderId, receiverId, payload.getContent());

            // 2. Broadcast the message DTO directly to the recipient's private queue
            // Spring dynamically resolves this to: /user/{receiverId}/queue/messages
            messagingTemplate.convertAndSendToUser(
                    receiverId.toString(),
                    "/queue/messages",
                    savedMessage
            );

            // 3. Send a copy back to the sender so their own UI updates instantly
            messagingTemplate.convertAndSendToUser(
                    senderId.toString(),
                    "/queue/messages",
                    savedMessage
            );

        } catch (Exception e) {
            System.err.println("Failed to process private message: " + e.getMessage());
        }
    }
}