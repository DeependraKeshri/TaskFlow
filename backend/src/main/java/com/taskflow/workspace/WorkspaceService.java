package com.taskflow.workspace;

import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.user.User;
import com.taskflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;

    private final WorkspaceMemberRepository workspaceMemberRepository;

    private final UserRepository userRepository;

    public WorkspaceResponse create(
            CreateWorkspaceRequest request,
            User currentUser
    ) {

        Workspace workspace = Workspace.builder()
                .name(request.name().trim())
                .description(request.description())
                .owner(currentUser)
                .build();

        workspace = workspaceRepository.save(workspace);

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(workspace)
                .user(currentUser)
                .role(WorkspaceRole.OWNER)
                .build();

        workspaceMemberRepository.save(member);

        return WorkspaceResponse.from(workspace);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getMyWorkspaces(
            User currentUser
    ) {

        return workspaceMemberRepository
                .findByUserId(currentUser.getId())
                .stream()
                .map(WorkspaceMember::getWorkspace)
                .map(WorkspaceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(
            UUID workspaceId,
            User currentUser
    ) {

        Workspace workspace =
                getWorkspaceEntity(workspaceId);

        ensureMember(
                workspaceId,
                currentUser.getId()
        );

        return WorkspaceResponse.from(workspace);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> getMembers(
            UUID workspaceId,
            User currentUser
    ) {

        getWorkspaceEntity(workspaceId);

        ensureMember(
                workspaceId,
                currentUser.getId()
        );

        return workspaceMemberRepository
                .findAll()
                .stream()
                .filter(member ->
                        member.getWorkspace()
                                .getId()
                                .equals(workspaceId)
                )
                .map(WorkspaceMemberResponse::from)
                .toList();
    }

    public WorkspaceMemberResponse addMember(
            UUID workspaceId,
            AddWorkspaceMemberRequest request,
            User currentUser
    ) {

        Workspace workspace =
                getWorkspaceEntity(workspaceId);

        ensureAdminOrOwner(
                workspace,
                currentUser
        );

        User user =
                userRepository
                        .findByEmail(
                                request.email().trim()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found with email: "
                                                + request.email().trim()
                                )
                        );

        if (workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(
                        workspaceId,
                        user.getId()
                )) {

            throw new IllegalStateException(
                    "User is already a member of this workspace"
            );
        }

        if (request.role() == WorkspaceRole.OWNER) {
            throw new IllegalArgumentException(
                    "Workspace owner role cannot be assigned"
            );
        }

        if (
                request.role() == WorkspaceRole.ADMIN
                && !workspace.getOwner()
                        .getId()
                        .equals(currentUser.getId())
        ) {

            throw new SecurityException(
                    "Only workspace owner can assign ADMIN role"
            );
        }

        WorkspaceMember member =
                WorkspaceMember.builder()
                        .workspace(workspace)
                        .user(user)
                        .role(request.role())
                        .build();

        member =
                workspaceMemberRepository.save(member);

        return WorkspaceMemberResponse.from(member);
    }

    public WorkspaceMemberResponse updateMember(
            UUID workspaceId,
            UUID memberId,
            UpdateWorkspaceMemberRequest request,
            User currentUser
    ) {

        Workspace workspace =
                getWorkspaceEntity(workspaceId);

        ensureAdminOrOwner(
                workspace,
                currentUser
        );

        WorkspaceMember member =
                workspaceMemberRepository
                        .findById(memberId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Workspace member not found"
                                )
                        );

        ensureMemberBelongsToWorkspace(
                member,
                workspaceId
        );

        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new IllegalArgumentException(
                    "Workspace owner role cannot be changed"
            );
        }

        if (request.role() == WorkspaceRole.OWNER) {
            throw new IllegalArgumentException(
                    "Workspace owner role cannot be assigned"
            );
        }

        if (
                request.role() == WorkspaceRole.ADMIN
                && !workspace.getOwner()
                        .getId()
                        .equals(currentUser.getId())
        ) {

            throw new SecurityException(
                    "Only workspace owner can assign ADMIN role"
            );
        }

        member.setRole(request.role());

        return WorkspaceMemberResponse.from(member);
    }

    public void removeMember(
            UUID workspaceId,
            UUID memberId,
            User currentUser
    ) {

        Workspace workspace =
                getWorkspaceEntity(workspaceId);

        ensureAdminOrOwner(
                workspace,
                currentUser
        );

        WorkspaceMember member =
                workspaceMemberRepository
                        .findById(memberId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Workspace member not found"
                                )
                        );

        ensureMemberBelongsToWorkspace(
                member,
                workspaceId
        );

        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new IllegalArgumentException(
                    "Workspace owner cannot be removed"
            );
        }

        if (member.getUser()
                .getId()
                .equals(currentUser.getId())) {

            throw new IllegalArgumentException(
                    "You cannot remove yourself from the workspace"
            );
        }

        workspaceMemberRepository.delete(member);
    }

    public WorkspaceResponse update(
            UUID workspaceId,
            UpdateWorkspaceRequest request,
            User currentUser
    ) {

        Workspace workspace =
                getWorkspaceEntity(workspaceId);

        ensureAdminOrOwner(
                workspace,
                currentUser
        );

        if (request.name() != null) {
            workspace.setName(
                    request.name().trim()
            );
        }

        if (request.description() != null) {
            workspace.setDescription(
                    request.description()
            );
        }

        return WorkspaceResponse.from(workspace);
    }

    public void delete(
            UUID workspaceId,
            User currentUser
    ) {

        Workspace workspace =
                getWorkspaceEntity(workspaceId);

        if (!workspace.getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new SecurityException(
                    "Only workspace owner can delete workspace"
            );
        }

        workspaceRepository.delete(workspace);
    }

    public Workspace getWorkspaceEntity(
            UUID workspaceId
    ) {

        return workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace not found"
                        )
                );
    }

    private void ensureMember(
            UUID workspaceId,
            UUID userId
    ) {

        if (!workspaceMemberRepository
                .existsByWorkspaceIdAndUserId(
                        workspaceId,
                        userId
                )) {

            throw new SecurityException(
                    "You are not a member of this workspace"
            );
        }
    }

    private void ensureMemberBelongsToWorkspace(
            WorkspaceMember member,
            UUID workspaceId
    ) {

        if (!member.getWorkspace()
                .getId()
                .equals(workspaceId)) {

            throw new SecurityException(
                    "Workspace member does not belong to this workspace"
            );
        }
    }

    private void ensureAdminOrOwner(
            Workspace workspace,
            User currentUser
    ) {

        if (workspace.getOwner()
                .getId()
                .equals(currentUser.getId())) {

            return;
        }

        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceIdAndUserId(
                                workspace.getId(),
                                currentUser.getId()
                        )
                        .orElseThrow(() ->
                                new SecurityException(
                                        "You are not a workspace member"
                                )
                        );

        if (
                member.getRole() != WorkspaceRole.ADMIN
        ) {

            throw new SecurityException(
                    "Admin permission required"
            );
        }
    }
}