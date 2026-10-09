package com.taskflow.attachment;

import java.time.Instant;
import java.util.UUID;

public record AttachmentResponse(
        UUID id,
        UUID taskId,
        String originalFileName,
        String contentType,
        long fileSize,
        Instant createdAt
) {
}
