package com.taskflow.workspace;

import jakarta.validation.constraints.NotNull;

public record UpdateWorkspaceMemberRequest(

        @NotNull
        WorkspaceRole role
) {
}