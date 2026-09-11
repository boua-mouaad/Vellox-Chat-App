package com.mouaad.vellox.repositories;

import com.mouaad.vellox.entities.Message;
import com.mouaad.vellox.entities.Room;
import com.mouaad.vellox.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    //Group CHAT :
    //Fetch all messages for a specific room
    List<Message> findByRoomOrderByCreatedAtAsc(Room room);

    //Private CHAT :
    //We use custom Query because the message could have been sent by either users
    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender = :userA AND m.receiver = :userB) OR " +
            "(m.sender = :userB AND m.receiver = :userA) " +
            "ORDER BY m.createdAt ASC")
    List<Message> findPrivateMessages(@Param("userA") User userA, @Param("userB") User userB);
}
