package com.taskflow.taskshare;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TaskShareRequest(

        @NotNull(
                message = "User ID is required"
        )
        UUID userId,

        @NotNull(
                message = "Permission is required"
        )
        TaskSharePermission permission
) {
}