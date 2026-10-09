package com.taskflow.auth;

import com.taskflow.user.User;

import java.util.UUID;

public record AuthResponse(

        String token,

        String tokenType,

        UUID userId,

        String name,

        String email,

        String role
) {

    public static AuthResponse from(
            String token,
            User user
    ) {

        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}