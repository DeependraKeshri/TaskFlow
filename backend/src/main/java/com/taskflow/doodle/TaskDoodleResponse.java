package com.taskflow.doodle;

import java.time.Instant;
import java.util.UUID;

public record TaskDoodleResponse(
        UUID id,
        UUID taskId,
        String imageData,
        Instant createdAt,
        Instant updatedAt
) {
}
