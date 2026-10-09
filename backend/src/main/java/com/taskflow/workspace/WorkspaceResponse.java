package com.taskflow.workspace;

import java.time.Instant;
import java.util.UUID;

public record WorkspaceResponse(

        UUID id,

        String name,

        String description,

        UUID ownerId,

        String ownerName,

        Instant createdAt
) {

    public static WorkspaceResponse from(
            Workspace workspace
    ) {

        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getOwner().getId(),
                workspace.getOwner().getName(),
                workspace.getCreatedAt()
        );
    }
}