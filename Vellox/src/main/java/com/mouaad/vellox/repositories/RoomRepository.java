package com.mouaad.vellox.repositories;

import com.mouaad.vellox.entities.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    //Find a room by its code
    Optional<Room> findByRoomCode(String roomCode);

    //Efficiently check if a genrated code already exists to prevent collisions
    boolean existsByRoomCode(String roomCode);
}
