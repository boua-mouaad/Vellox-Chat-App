package com.mouaad.vellox.repositories;

import com.mouaad.vellox.entities.Friendship;
import com.mouaad.vellox.entities.FriendshipStatus;
import com.mouaad.vellox.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {
    // Checks if any request exists between two users (regardless of who sent it)
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END " +
            "FROM Friendship f WHERE " +
            "(f.requester = :userA AND f.addressee = :userB) OR " +
            "(f.requester = :userB AND f.addressee = :userA)")
    boolean existsByUsers(@Param("userA") User userA, @Param("userB") User userB);

    // Finds a specific pending request to accept or decline
    Optional<Friendship> findByIdAndStatus(UUID id, FriendshipStatus status);
    // Retrieves all active friends for a specific user
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requester = :user OR f.addressee = :user) AND f.status = 'ACCEPTED'")
    List<Friendship> findAllAcceptedFriendsByUser(@Param("user") User user);
}
