package com.taskflow.workspace;

import jakarta.validation.constraints.Size;

public record UpdateWorkspaceRequest(

        @Size(max = 200, message = "Workspace name cannot exceed 200 characters")
        String name,

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        String description
) {
}