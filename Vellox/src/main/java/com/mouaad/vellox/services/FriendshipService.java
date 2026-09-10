package com.mouaad.vellox.services;

import com.mouaad.vellox.entities.Friendship;
import com.mouaad.vellox.entities.FriendshipStatus;
import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.repositories.FriendshipRepository;
import com.mouaad.vellox.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@AllArgsConstructor
public class FriendshipService {
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    /**
     * Initiates a friend request from one user to another via username.
     */
    @Transactional
    public Friendship sendFriendRequest(UUID requesterId, String targetUsername) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Requester not found"));

        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        if (requester.getId().equals(target.getId())) {
            throw new IllegalArgumentException("You cannot send a friend request to yourself.");
        }
        if (friendshipRepository.existsByUsers(requester, target)) {
            throw new IllegalArgumentException("A friendship or pending requests already exist.");
        }

        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setAddressee(target);
        friendship.setStatus(FriendshipStatus.PENDING);

        return friendshipRepository.save(friendship);
    }

    /**
     * Accepts a pending friend request.
     */
    @Transactional
    public void acceptFriendRequest(UUID friendshipId, UUID targetUserId) {
        Friendship friendship = friendshipRepository.findByIdAndStatus(friendshipId, FriendshipStatus.PENDING)
                .orElseThrow(() -> new IllegalArgumentException("Pending friend request not found"));
        // Ensure the person accepting the request is actually the intended addressee
        if (!friendship.getAddressee().getId().equals(targetUserId)) {
            throw new SecurityException("You are not authorized to accept this request.");
        }
        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);
    }

    /**
     * Declines a pending friend request.
     * We delete the record entirely to keep the database clean and allow
     * future requests to be sent without conflicting with a 'DECLINED' state.
     */
    @Transactional
    public void declineFriendRequest(UUID friendshipId, UUID targetUserId) {
        //1.find the specific pending request
        Friendship friendship = friendshipRepository.findByIdAndStatus(friendshipId, FriendshipStatus.PENDING)
                .orElseThrow(() -> new IllegalArgumentException("Pending friend request not found"));
        if (!friendship.getAddressee().getId().equals(targetUserId)) {
            throw new SecurityException("You are not authorized to decline this request.");
        }
        friendship.setStatus(FriendshipStatus.REJECTED);
        friendshipRepository.delete(friendship);
    }
}

