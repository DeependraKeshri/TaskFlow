package com.taskflow.project;

import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.user.User;
import com.taskflow.workspace.Workspace;
import com.taskflow.workspace.WorkspaceMemberRepository;
import com.taskflow.workspace.WorkspaceService;
import com.taskflow.workspace.WorkspaceRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    private final WorkspaceService workspaceService;

    private final WorkspaceMemberRepository workspaceMemberRepository;

    public ProjectResponse create(
            UUID workspaceId,
            CreateProjectRequest request,
            User currentUser
    ) {

        Workspace workspace =
                workspaceService.getWorkspaceEntity(
                        workspaceId
                );

        ensureMember(
                workspaceId,
                currentUser.getId()
        );

        Project project = Project.builder()
                .name(request.name().trim())
                .description(request.description())
                .workspace(workspace)
                .createdBy(currentUser)
                .build();

        return ProjectResponse.from(
                projectRepository.save(project)
        );
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(
            UUID workspaceId,
            User currentUser
    ) {

        ensureMember(
                workspaceId,
                currentUser.getId()
        );

        return projectRepository
                .findByWorkspaceId(workspaceId)
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(
            UUID projectId,
            User currentUser
    ) {

        Project project =
                getProjectEntity(projectId);

        ensureMember(
                project.getWorkspace().getId(),
                currentUser.getId()
        );

        return ProjectResponse.from(project);
    }

    public ProjectResponse update(
            UUID projectId,
            UpdateProjectRequest request,
            User currentUser
    ) {

        Project project =
                getProjectEntity(projectId);

        ensureCanModify(
                project,
                currentUser
        );

        if (request.name() != null) {
            project.setName(
                    request.name().trim()
            );
        }

        if (request.description() != null) {
            project.setDescription(
                    request.description()
            );
        }

        return ProjectResponse.from(project);
    }

    public void delete(
            UUID projectId,
            User currentUser
    ) {

        Project project =
                getProjectEntity(projectId);

        ensureCanModify(
                project,
                currentUser
        );

        projectRepository.delete(project);
    }

    public Project getProjectEntity(
            UUID projectId
    ) {

        return projectRepository
                .findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
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

    private void ensureCanModify(
            Project project,
            User currentUser
    ) {

        if (project.getCreatedBy()
                .getId()
                .equals(currentUser.getId())) {

            return;
        }

        WorkspaceMemberRepository repo =
                workspaceMemberRepository;

        var member =
                repo.findByWorkspaceIdAndUserId(
                        project.getWorkspace().getId(),
                        currentUser.getId()
                ).orElseThrow(() ->
                        new SecurityException(
                                "You are not a workspace member"
                        )
                );

        if (
                member.getRole() != WorkspaceRole.OWNER
                        && member.getRole() != WorkspaceRole.ADMIN
        ) {

            throw new SecurityException(
                    "You don't have permission to modify this project"
            );
        }
    }
}