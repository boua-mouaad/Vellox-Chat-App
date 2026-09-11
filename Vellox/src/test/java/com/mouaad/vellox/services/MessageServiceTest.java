package com.mouaad.vellox.services;

import com.mouaad.vellox.dtos.MessageResponseDto;
import com.mouaad.vellox.entities.Message;
import com.mouaad.vellox.entities.Room;
import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.repositories.MessageRepository;
import com.mouaad.vellox.repositories.RoomMemberRepository;
import com.mouaad.vellox.repositories.RoomRepository;
import com.mouaad.vellox.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomMemberRepository roomMemberRepository;

    @InjectMocks
    private MessageService messageService;

    private User sender;
    private User receiver;
    private Room room;
    private UUID senderId;
    private UUID receiverId;
    private UUID roomId;

    @BeforeEach
    void setUp() {
        senderId = UUID.randomUUID();
        receiverId = UUID.randomUUID();
        roomId = UUID.randomUUID();

        sender = new User();
        sender.setId(senderId);
        sender.setUsername("sender_user");

        receiver = new User();
        receiver.setId(receiverId);
        receiver.setUsername("receiver_user");

        room = new Room();
        room.setId(roomId);
        room.setName("Test Room");
    }

    @Test
    void saveRoomMessage_shouldSaveAndReturnDto() {
        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(roomMemberRepository.existsByRoomAndUser(room, sender)).thenReturn(true);
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message m = invocation.getArgument(0);
            m.setId(UUID.randomUUID());
            m.setCreatedAt(LocalDateTime.now());
            return m;
        });

        MessageResponseDto dto = messageService.saveRoomMessage(senderId, roomId, "Hello room!");

        assertNotNull(dto);
        assertEquals("Hello room!", dto.getContent());
        assertEquals(senderId, dto.getSenderId());
        assertEquals("sender_user", dto.getSenderUsername());
        assertEquals(roomId, dto.getRoomId());
        assertNotNull(dto.getCreatedAt());
    }

    @Test
    void saveRoomMessage_whenBlankContent_shouldThrowException() {
        assertThrows(IllegalArgumentException.class, () ->
                messageService.saveRoomMessage(senderId, roomId, "   ")
        );
    }

    @Test
    void savePrivateMessage_shouldSaveAndReturnDto() {
        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(userRepository.findById(receiverId)).thenReturn(Optional.of(receiver));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message m = invocation.getArgument(0);
            m.setId(UUID.randomUUID());
            m.setCreatedAt(LocalDateTime.now());
            return m;
        });

        MessageResponseDto dto = messageService.savePrivateMessage(senderId, receiverId, "Hey friend!");

        assertNotNull(dto);
        assertEquals("Hey friend!", dto.getContent());
        assertEquals(senderId, dto.getSenderId());
        assertEquals(receiverId, dto.getReceiverId());
        assertNotNull(dto.getCreatedAt());
    }

    @Test
    void savePrivateMessage_toSelf_shouldThrowException() {
        assertThrows(IllegalArgumentException.class, () ->
                messageService.savePrivateMessage(senderId, senderId, "Talking to myself")
        );
    }
}
