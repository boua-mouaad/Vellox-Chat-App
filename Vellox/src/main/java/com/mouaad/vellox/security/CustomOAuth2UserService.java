package com.mouaad.vellox.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mouaad.vellox.entities.User;
import com.mouaad.vellox.repositories.UserRepository;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(@NonNull OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId().toUpperCase();

        String email = oAuth2User.getAttribute("email");

        // GitHub returns email == null in /user if the user's email is set to private in GitHub settings.
        // Fetch verified email from GitHub's /user/emails endpoint using the access token.
        if (email == null && "GITHUB".equalsIgnoreCase(provider)) {
            email = fetchGitHubEmail(userRequest.getAccessToken().getTokenValue());
        }

        // If email is still not returned, fallback to the official GitHub noreply email address
        if (email == null && "GITHUB".equalsIgnoreCase(provider)) {
            String login = oAuth2User.getAttribute("login");
            Object id = oAuth2User.getAttribute("id");
            if (login != null && !login.isBlank()) {
                email = (id != null ? id : "github") + "+" + login + "@users.noreply.github.com";
                log.info("Using GitHub noreply email for user {}: {}", login, email);
            }
        }

        if (email == null || email.isBlank()) {
            OAuth2Error error = new OAuth2Error(
                    "email_not_found",
                    "Email not found from " + provider + ". Please make sure your email is verified in your account settings.",
                    null
            );
            throw new OAuth2AuthenticationException(error, error.getDescription());
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            User newUser = new User();

            String baseName = null;
            if ("GITHUB".equalsIgnoreCase(provider)) {
                String login = oAuth2User.getAttribute("login");
                if (login != null && !login.isBlank()) {
                    baseName = login.replaceAll("[^a-zA-Z0-9_]", "_");
                }
            }
            if (baseName == null || baseName.isBlank()) {
                baseName = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
            }

            String providerSuffix = "_" + provider.toLowerCase();
            int maxBaseLen = 32 - providerSuffix.length();
            if (baseName.length() > maxBaseLen) {
                baseName = baseName.substring(0, maxBaseLen);
            }
            String generatedUsername = baseName + providerSuffix;

            if (userRepository.existsByUsername(generatedUsername)) {
                String randomSuffix = UUID.randomUUID().toString().substring(0, 4);
                int maxWithRandom = 32 - providerSuffix.length() - 5;
                if (baseName.length() > maxWithRandom) {
                    baseName = baseName.substring(0, maxWithRandom);
                }
                generatedUsername = baseName + "_" + randomSuffix + providerSuffix;
            }

            newUser.setUsername(generatedUsername);
            newUser.setEmail(email);
            newUser.setAuthProvider(provider);
            newUser.setVerified(true);

            userRepository.save(newUser);
        }

        // Return an OAuth2User whose attributes map explicitly contains "email"
        // so OAuth2LoginSuccessHandler can retrieve it reliably.
        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        attributes.put("email", email);

        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
        if (userNameAttributeName == null || userNameAttributeName.isBlank()) {
            userNameAttributeName = "GITHUB".equalsIgnoreCase(provider) ? "id" : "sub";
        }

        return new DefaultOAuth2User(oAuth2User.getAuthorities(), attributes, userNameAttributeName);
    }

    private String fetchGitHubEmail(String accessToken) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.github.com/user/emails"))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Accept", "application/vnd.github+json")
                    .header("User-Agent", "Vellox-App")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode emailsNode = mapper.readTree(response.body());
                if (emailsNode.isArray()) {
                    String primaryVerified = null;
                    String anyPrimary = null;
                    String anyVerified = null;
                    String firstEmail = null;

                    for (JsonNode node : emailsNode) {
                        String emailVal = node.path("email").asText(null);
                        if (emailVal == null || emailVal.isBlank()) {
                            continue;
                        }
                        if (firstEmail == null) {
                            firstEmail = emailVal;
                        }
                        boolean isPrimary = node.path("primary").asBoolean(false);
                        boolean isVerified = node.path("verified").asBoolean(false);

                        if (isPrimary && isVerified) {
                            primaryVerified = emailVal;
                            break;
                        }
                        if (isPrimary && anyPrimary == null) {
                            anyPrimary = emailVal;
                        }
                        if (isVerified && anyVerified == null) {
                            anyVerified = emailVal;
                        }
                    }

                    if (primaryVerified != null) return primaryVerified;
                    if (anyPrimary != null) return anyPrimary;
                    if (anyVerified != null) return anyVerified;
                    if (firstEmail != null) return firstEmail;
                }
            } else {
                log.warn("GitHub emails API responded with status code: {}", response.statusCode());
            }
        } catch (Exception e) {
            log.error("Failed to fetch emails from GitHub API: {}", e.getMessage(), e);
        }
        return null;
    }
}