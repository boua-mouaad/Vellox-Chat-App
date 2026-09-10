package com.mouaad.vellox.repositories;

import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.entities.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, UUID> {
    // Finds a specific, unconsumed code for a specific user to validate their email.
    Optional<VerificationCode> findByCodeAndUserAndConsumedFalse(String code, User user);

    // Deletes all codes for a specific user (useful for cleanup if they request a new code)
    void deleteByUser(User user);
}
