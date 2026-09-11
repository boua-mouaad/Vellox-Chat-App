package com.mouaad.vellox.config;

import com.mouaad.vellox.security.CustomUserDetailsService;
import com.mouaad.vellox.security.JwtService;
import lombok.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configures the real-time WebSocket messaging broker and enforces JWT security.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public WebSocketConfig(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Defines the WebSocket endpoint.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173");
    }

    /**
     * Configures message destinations.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // Client -> Server
        registry.setApplicationDestinationPrefixes("/app");

        // Server -> Client
        registry.enableSimpleBroker("/topic", "/user");

        // Private messages
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Intercepts STOMP CONNECT requests and authenticates users using JWT.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {

        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(
                    @NonNull Message<?> message,
                    @NonNull MessageChannel channel
            ) {

                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(
                                message,
                                StompHeaderAccessor.class
                        );

                if (accessor != null
                        && StompCommand.CONNECT.equals(accessor.getCommand())) {

                    String authHeader =
                            accessor.getFirstNativeHeader("Authorization");

                    if (authHeader != null
                            && authHeader.startsWith("Bearer ")) {

                        String token = authHeader.substring(7);

                        String username =
                                jwtService.extractUsername(token);

                        if (username != null) {

                            UserDetails userDetails =
                                    userDetailsService
                                            .loadUserByUsername(username);

                            if (jwtService.isTokenValid(
                                    token,
                                    userDetails
                            )) {

                                UsernamePasswordAuthenticationToken
                                        authentication =
                                        new UsernamePasswordAuthenticationToken(
                                                userDetails,
                                                null,
                                                userDetails.getAuthorities()
                                        );

                                // Associate authenticated user
                                // with this WebSocket session
                                accessor.setUser(authentication);
                            }
                        }
                    }
                }

                return message;
            }
        });
    }
}