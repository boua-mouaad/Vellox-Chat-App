package com.mouaad.vellox.services;

import com.mouaad.vellox.entities.Room;
import com.mouaad.vellox.entities.RoomMember;
import com.mouaad.vellox.entities.RoomRole;
import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.repositories.RoomMemberRepository;
import com.mouaad.vellox.repositories.RoomRepository;
import com.mouaad.vellox.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mouaad.vellox.dtos.RoomSummaryDto;

import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@AllArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomMemberRepository roomMemberRepository;


    /**
     * Creates a new chat room, generates a unique shareable code,
     * and automatically adds the creator as the room OWNER.
     */
    @Transactional
    public Room createRoom(UUID ownerId, String roomName) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        //Create room
        Room room = new Room();
        room.setOwner(owner);
        room.setName(roomName);
        room.setRoomCode(generateUniqueRoomCode());

        Room savedRoom = roomRepository.save(room);

        //Add the creator as the first memebmer with the Owner role
        RoomMember roomMember = new RoomMember();
        roomMember.setRoom(savedRoom);
        roomMember.setUser(owner);
        roomMember.setRole(RoomRole.OWNER);

        roomMemberRepository.save(roomMember);
        return savedRoom;
    }

    /**
     * Allows a user to join an existing room using its shareable code.
     */
    @Transactional
    public void joinRoom(UUID userId, String roomCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // Prevent users from joining a room they are already in
        if (roomMemberRepository.existsByRoomAndUser(room, user)) {
            throw new IllegalStateException("You are already in this room");
        }


        //Add the new user as a standard member
        RoomMember newMember = new RoomMember();
        newMember.setRoom(room);
        newMember.setUser(user);
        newMember.setRole(RoomRole.MEMBER);

        roomMemberRepository.save(newMember);

    }

    /**
     * Retrieves all rooms the specified user is a member of.
     */
    @Transactional(readOnly = true)
    public List<RoomSummaryDto> getUserRooms(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return roomMemberRepository.findAllByUser(user).stream()
                .map(member -> RoomSummaryDto.builder()
                        .id(member.getRoom().getId())
                        .name(member.getRoom().getName())
                        .roomCode(member.getRoom().getRoomCode())
                        .role(member.getRole().name())
                        .ownerUsername(member.getRoom().getOwner() != null ? member.getRoom().getOwner().getUsername() : null)
                        .build())
                .toList();
    }

    //Method to generate an 8-character alphanumeric code
    private String generateUniqueRoomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        Random random = new Random();

        // Generate an 8-character string formatted as XXXX-XXXX
        for (int i = 0; i < 8; i++) {
            if (i == 4) {
                codeBuilder.append("-");
            }
            codeBuilder.append(characters.charAt(random.nextInt(characters.length())));
        }

        String generatedCode = codeBuilder.toString();

        // Collision Check: If this highly unlikely event happens, generate a new one recursively
        if (roomRepository.existsByRoomCode(generatedCode)) {
            return generateUniqueRoomCode();
        }
        return generatedCode;
    }
}
