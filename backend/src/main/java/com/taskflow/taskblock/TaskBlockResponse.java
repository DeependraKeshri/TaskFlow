package com.taskflow.taskblock;

import java.time.Instant;
import java.util.UUID;

public record TaskBlockResponse(
    UUID id,
    UUID taskId,
    TaskBlockType blockType,
    String content,
    Integer position,
    Instant createdAt,
    Instant updatedAt
) {}
