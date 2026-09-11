package com.mouaad.vellox.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    // L'URL de ton application React où l'on va envoyer le token
    private final String frontendUrl = "http://localhost:5173/oauth2/redirect";

    public OAuth2LoginSuccessHandler(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void onAuthenticationSuccess(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        // 1. Récupère l'utilisateur fourni par Google/GitHub
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // 2. Charge notre UserDetails depuis notre CustomUserDetailsService
        // (pour s'assurer que le "Subject" du JWT est bien notre UUID de la base de données)
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        // 3. Génère le token JWT
        String token = jwtService.generateToken(userDetails);

        // 4. Redirige vers React en passant le token dans l'URL
        // React lira l'URL, extraira le token, le sauvegardera, et supprimera l'URL de l'historique
        String targetUrl = frontendUrl + "?token=" + token;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}