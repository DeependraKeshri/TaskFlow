package com.taskflow.project;

import java.time.Instant;
import java.util.UUID;

public record ProjectResponse(

        UUID id,

        String name,

        String description,

        UUID workspaceId,

        UUID createdBy,

        String createdByName,

        Instant createdAt
) {

    public static ProjectResponse from(
            Project project
    ) {

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getWorkspace().getId(),
                project.getCreatedBy().getId(),
                project.getCreatedBy().getName(),
                project.getCreatedAt()
        );
    }
}