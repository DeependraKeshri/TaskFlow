package com.taskflow.task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(

        UUID id,

        String title,

        String description,

        TaskStatus status,

        TaskPriority priority,

        UUID projectId,

        String projectName,

        UUID createdBy,

        String createdByName,

        UUID assignedTo,

        String assignedToName,

        LocalDate dueDate,

        Integer position,

        Boolean pinned,

        Boolean locked,

        Boolean archived,

        Instant deletedAt,

        Instant createdAt,

        Instant updatedAt
) {
}