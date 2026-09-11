package com.mouaad.vellox.repositories;

import com.mouaad.vellox.entities.Room;
import com.mouaad.vellox.entities.RoomMember;
import com.mouaad.vellox.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    //Check if a specific user is already inside a specific room
    boolean existsByRoomAndUser(Room room, User user);

    //Retrieves the membership record
    Optional<RoomMember> findByRoomAndUser(Room room, User user);

    //List of all user in a specific room
    List<RoomMember> findAllByRoom(Room room);

    //Lists all rooms a specific user is a part of
    List<RoomMember> findAllByUser(User user);
}
