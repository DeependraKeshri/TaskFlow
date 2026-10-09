package com.taskflow.user;

import java.util.UUID;

public record UserSearchResponse(
        UUID id,
        String name,
        String email
) {}
