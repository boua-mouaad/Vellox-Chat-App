package com.mouaad.vellox.services;

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
    public Message saveRoomMessage(UUID senderId, UUID roomId, String content) {
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
        message.setContent(content);

        return messageRepository.save(message);
    }

    public List<Message> getRoomMessages(UUID userId, UUID roomId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found."));

        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            throw new SecurityException("You do not have permission to view this room's history.");
        }

        return messageRepository.findByRoomOrderByCreatedAtAsc(room);
    }

    @Transactional
    public Message savePrivateMessage(UUID senderId, UUID receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found."));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found."));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);

        return messageRepository.save(message);
    }

    public List<Message> getPrivateMessages(UUID userId1, UUID userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new IllegalArgumentException("First user not found."));

        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new IllegalArgumentException("Second user not found."));

        return messageRepository.findPrivateMessages(user1, user2);
    }
}
