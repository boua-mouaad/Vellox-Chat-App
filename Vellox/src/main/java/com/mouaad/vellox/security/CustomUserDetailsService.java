package com.mouaad.vellox.security;

import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // 1. Try to find the user by UUID first (since JWT subject is the user's UUID)
        User user = null;
        try {
            UUID userId = UUID.fromString(identifier);
            user = userRepository.findById(userId).orElse(null);
        } catch (IllegalArgumentException ignored) {
            // Not a UUID string, proceed to lookup by Email or Username
        }

        // 2. If not found by UUID, try to find the user by Email, then Username
        if (user == null) {
            user = userRepository.findByEmail(identifier)
                    .orElseGet(() -> userRepository.findByUsername(identifier)
                            .orElseThrow(() -> new UsernameNotFoundException("User not found with email, username or id: " + identifier)));
        }
        // 2. Map our custom JPA User entity to Spring Security's expected UserDetails object
        return org.springframework.security.core.userdetails.User.builder()
                // We set the Subject/Principal to the UUID string.
                // This ensures Principal.getName() in our Controllers returns the UUID, not the email.
                .username(user.getId().toString())
                // If the user registered via Google/GitHub, they might not have a local password.
                // We provide an empty string to prevent NullPointerExceptions, though OAuth2 handles this differently.
                .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")

                // Spring Security will automatically reject the login attempt if this is true
                .disabled(!user.isVerified())

                // Assign a default authority/role to the user
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }
}
