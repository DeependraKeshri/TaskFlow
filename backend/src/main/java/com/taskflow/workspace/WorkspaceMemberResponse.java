package com.taskflow.workspace;

import java.util.UUID;

public record WorkspaceMemberResponse(
        UUID id,
        UUID userId,
        String userName,
        String userEmail,
        WorkspaceRole role
) {

    public static WorkspaceMemberResponse from(
            WorkspaceMember member
    ) {

        return new WorkspaceMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getName(),
                member.getUser().getEmail(),
                member.getRole()
        );
    }
}