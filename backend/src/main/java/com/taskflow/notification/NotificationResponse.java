package com.taskflow.notification;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID recipientId,
        UUID actorId,
        String actorName,
        UUID taskId,
        String taskTitle,
        UUID commentId,
        NotificationType type,
        String message,
        boolean read,
        Instant createdAt,
        Instant readAt
) {
}