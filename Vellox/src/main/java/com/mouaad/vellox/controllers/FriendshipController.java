package com.mouaad.vellox.controllers;

import com.mouaad.vellox.dtos.ApiResponse;
import com.mouaad.vellox.dtos.FriendRequestDto;
import com.mouaad.vellox.dtos.FriendshipResponseDto;
import com.mouaad.vellox.dtos.UserSummaryDto;
import com.mouaad.vellox.services.FriendshipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;

    public FriendshipController(FriendshipService friendshipService) {
        this.friendshipService = friendshipService;
    }

    /**
     * Retrieves all active accepted friends for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<UserSummaryDto>> getFriends(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        List<UserSummaryDto> friends = friendshipService.getAcceptedFriends(userId);
        return ResponseEntity.ok(friends);
    }

    /**
     * Retrieves all pending incoming friend requests for the logged-in user.
     */
    @GetMapping("/requests/pending")
    public ResponseEntity<List<FriendshipResponseDto>> getPendingRequests(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        List<FriendshipResponseDto> pending = friendshipService.getPendingFriendRequests(userId);
        return ResponseEntity.ok(pending);
    }

    /**
     * Sends a friend request to another user by their username.
     */
    @PostMapping("/requests")
    public ResponseEntity<ApiResponse> sendRequest(
            @Valid @RequestBody FriendRequestDto requestDto,
            Principal principal) {
        UUID requesterId = UUID.fromString(principal.getName());
        friendshipService.sendFriendRequest(requesterId, requestDto.getTargetUsername());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse("Friend request sent successfully.", true));
    }

    /**
     * Accepts a pending friend request.
     */
    @PutMapping("/requests/{id}/accept")
    public ResponseEntity<ApiResponse> acceptRequest(
            @PathVariable("id") UUID friendshipId,
            Principal principal) {
        UUID targetUserId = UUID.fromString(principal.getName());
        friendshipService.acceptFriendRequest(friendshipId, targetUserId);

        return ResponseEntity.ok(new ApiResponse("Friend request accepted.", true));
    }

    /**
     * Declines a pending friend request.
     */
    @DeleteMapping("/requests/{id}/decline")
    public ResponseEntity<ApiResponse> declineRequest(
            @PathVariable("id") UUID friendshipId,
            Principal principal) {
        UUID targetUserId = UUID.fromString(principal.getName());
        friendshipService.declineFriendRequest(friendshipId, targetUserId);

        return ResponseEntity.ok(new ApiResponse("Friend request declined.", true));
    }
}
