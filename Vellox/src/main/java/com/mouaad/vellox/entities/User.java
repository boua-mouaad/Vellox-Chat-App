package com.mouaad.vellox.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {
    //1. Core Identifiers
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "username", unique = true, nullable = false, length = 32)
    private String username;

    @Column(name = "email",  unique = true, nullable = false, length = 255)
    private String email;

    //2. Authentication & Security

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "auth_provider", nullable = false, length = 20)
    private String authProvider;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified;

    //3. Auditing Fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "upadated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // Default to LOCAL if not explicitly set by the OAuth2 pipeline
        if (this.authProvider == null) {
            this.authProvider = "LOCAL";
        }
    }



}
