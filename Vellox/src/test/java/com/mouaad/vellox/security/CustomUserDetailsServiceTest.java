package com.mouaad.vellox.security;

import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("mouaad");
        testUser.setEmail("mouaad@example.com");
        testUser.setPasswordHash("hashed_pw");
        testUser.setVerified(true);
    }

    @Test
    void loadUserByUsername_whenIdentifierIsUUID_shouldFindById() {
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername(testUserId.toString());

        assertNotNull(userDetails);
        assertEquals(testUserId.toString(), userDetails.getUsername());
        verify(userRepository).findById(testUserId);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void loadUserByUsername_whenIdentifierIsEmail_shouldFindByEmail() {
        when(userRepository.findByEmail("mouaad@example.com")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("mouaad@example.com");

        assertNotNull(userDetails);
        assertEquals(testUserId.toString(), userDetails.getUsername());
        verify(userRepository).findByEmail("mouaad@example.com");
    }

    @Test
    void loadUserByUsername_whenIdentifierIsUsername_shouldFindByUsername() {
        when(userRepository.findByEmail("mouaad")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("mouaad")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("mouaad");

        assertNotNull(userDetails);
        assertEquals(testUserId.toString(), userDetails.getUsername());
        verify(userRepository).findByUsername("mouaad");
    }

    @Test
    void loadUserByUsername_whenNotFound_shouldThrowException() {
        when(userRepository.findByEmail("unknown")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername("unknown")
        );
    }
}
