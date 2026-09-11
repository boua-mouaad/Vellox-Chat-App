package com.mouaad.vellox.controllers;

import com.mouaad.vellox.dtos.ApiResponse;
import com.mouaad.vellox.dtos.FriendRequestDto;
import com.mouaad.vellox.services.FriendshipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;

    public FriendshipController(FriendshipService friendshipService) {
        this.friendshipService = friendshipService;
    }

    /**
     * Sends a friend request to another user by their username.
     */
    @PostMapping("/requests")
    public ResponseEntity<ApiResponse> sendRequest(
            @Valid @RequestBody FriendRequestDto requestDto,
            Principal principal) {
        try {
            // principal.getName() extracts the authenticated user's ID from the JWT token
            UUID requesterId = UUID.fromString(principal.getName());

            friendshipService.sendFriendRequest(requesterId, requestDto.getTargetUsername());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new ApiResponse("Friend request sent successfully.", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }

    /**
     * Accepts a pending friend request.
     */
    @PutMapping("/requests/{id}/accept")
    public ResponseEntity<ApiResponse> acceptRequest(
            @PathVariable("id") UUID friendshipId,
            Principal principal) {
        try {
            UUID targetUserId = UUID.fromString(principal.getName());

            friendshipService.acceptFriendRequest(friendshipId, targetUserId);

            return ResponseEntity.ok(new ApiResponse("Friend request accepted.", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }

    /**
     * Declines a pending friend request.
     */
    @DeleteMapping("/requests/{id}/decline")
    public ResponseEntity<ApiResponse> declineRequest(
            @PathVariable("id") UUID friendshipId,
            Principal principal) {
        try {
            UUID targetUserId = UUID.fromString(principal.getName());

            friendshipService.declineFriendRequest(friendshipId, targetUserId);

            return ResponseEntity.ok(new ApiResponse("Friend request declined.", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }




}
