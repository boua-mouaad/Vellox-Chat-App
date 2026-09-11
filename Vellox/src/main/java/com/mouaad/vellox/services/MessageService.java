package com.mouaad.vellox.services;

import com.mouaad.vellox.dtos.MessageResponseDto;
import com.mouaad.vellox.entities.Message;
import com.mouaad.vellox.entities.Room;
import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.repositories.MessageRepository;
import com.mouaad.vellox.repositories.RoomMemberRepository;
import com.mouaad.vellox.repositories.RoomRepository;
import com.mouaad.vellox.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;

    public MessageService(MessageRepository messageRepository,
                          UserRepository userRepository,
                          RoomRepository roomRepository,
                          RoomMemberRepository roomMemberRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.roomMemberRepository = roomMemberRepository;
    }

    @Transactional
    public MessageResponseDto saveRoomMessage(UUID senderId, UUID roomId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be blank.");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found."));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found."));

        if (!roomMemberRepository.existsByRoomAndUser(room, sender)) {
            throw new SecurityException("You cannot send messages to a room you are not a member of.");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setRoom(room);
        message.setContent(content.trim());

        Message savedMessage = messageRepository.save(message);
        return MessageResponseDto.fromEntity(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDto> getRoomMessages(UUID userId, UUID roomId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found."));

        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            throw new SecurityException("You do not have permission to view this room's history.");
        }

        return messageRepository.findByRoomOrderByCreatedAtAsc(room)
                .stream()
                .map(MessageResponseDto::fromEntity)
                .toList();
    }

    @Transactional
    public MessageResponseDto savePrivateMessage(UUID senderId, UUID receiverId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be blank.");
        }

        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("You cannot send a private message to yourself.");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found."));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found."));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content.trim());

        Message savedMessage = messageRepository.save(message);
        return MessageResponseDto.fromEntity(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDto> getPrivateMessages(UUID userId1, UUID userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new IllegalArgumentException("First user not found."));

        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new IllegalArgumentException("Second user not found."));

        return messageRepository.findPrivateMessages(user1, user2)
                .stream()
                .map(MessageResponseDto::fromEntity)
                .toList();
    }
}
