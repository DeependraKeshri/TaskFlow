package com.taskflow.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceMemberRepository
        extends JpaRepository<WorkspaceMember, UUID> {

    List<WorkspaceMember> findByUserId(UUID userId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(
            UUID workspaceId,
            UUID userId
    );

    boolean existsByWorkspaceIdAndUserId(
            UUID workspaceId,
            UUID userId
    );
}