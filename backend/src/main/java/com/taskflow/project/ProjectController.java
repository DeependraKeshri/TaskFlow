package com.taskflow.project;

import com.taskflow.common.CurrentUser;
import com.taskflow.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    private final CurrentUser currentUser;

    @PostMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<ProjectResponse> create(

            @PathVariable UUID workspaceId,

            @Valid
            @RequestBody
            CreateProjectRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        projectService.create(
                                workspaceId,
                                request,
                                user
                        )
                );
    }

    @GetMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<List<ProjectResponse>> getProjects(

            @PathVariable UUID workspaceId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                projectService.getProjects(
                        workspaceId,
                        user
                )
        );
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(

            @PathVariable UUID projectId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                projectService.getProject(
                        projectId,
                        user
                )
        );
    }

    @PatchMapping("/projects/{projectId}")
    public ResponseEntity<ProjectResponse> update(

            @PathVariable UUID projectId,

            @Valid
            @RequestBody
            UpdateProjectRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                projectService.update(
                        projectId,
                        request,
                        user
                )
        );
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<Void> delete(

            @PathVariable UUID projectId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        projectService.delete(
                projectId,
                user
        );

        return ResponseEntity.noContent().build();
    }
}