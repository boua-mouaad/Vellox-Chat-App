package com.mouaad.vellox.controllers;

import com.mouaad.vellox.dtos.ApiResponse;
import com.mouaad.vellox.dtos.CreateRoomRequest;
import com.mouaad.vellox.dtos.JoinRoomRequest;
import com.mouaad.vellox.dtos.RoomSummaryDto;
import com.mouaad.vellox.entities.Room;
import com.mouaad.vellox.services.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@Valid @RequestBody CreateRoomRequest request, Principal principal) {
        // Extract the UUID of the currently logged-in user from the JWT
        UUID ownerId = UUID.fromString(principal.getName());

        Room newRoom = roomService.createRoom(ownerId, request.getRoomName());

        // We send back the generated code so React can display it to the user immediately
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("message", "Room created successfully.");
        responseData.put("roomCode", newRoom.getRoomCode());
        responseData.put("roomId", newRoom.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(responseData);
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse> joinRoom(@Valid @RequestBody JoinRoomRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        roomService.joinRoom(userId, request.getRoomCode());

        return ResponseEntity.ok(new ApiResponse("Successfully joined the room.", true));
    }

    @GetMapping
    public ResponseEntity<List<RoomSummaryDto>> getUserRooms(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        List<RoomSummaryDto> rooms = roomService.getUserRooms(userId);
        return ResponseEntity.ok(rooms);
    }
}
