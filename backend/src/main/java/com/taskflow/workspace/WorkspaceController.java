package com.taskflow.workspace;

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
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @Valid
            @RequestBody
            CreateWorkspaceRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        workspaceService.create(
                                request,
                                user
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getMyWorkspaces(
            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                workspaceService.getMyWorkspaces(user)
        );
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(

            @PathVariable UUID workspaceId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                workspaceService.getWorkspace(
                        workspaceId,
                        user
                )
        );
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMemberResponse>> getMembers(

            @PathVariable UUID workspaceId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                workspaceService.getMembers(
                        workspaceId,
                        user
                )
        );
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<WorkspaceMemberResponse> addMember(

            @PathVariable UUID workspaceId,

            @Valid
            @RequestBody
            AddWorkspaceMemberRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        workspaceService.addMember(
                                workspaceId,
                                request,
                                user
                        )
                );
    }

    @PatchMapping("/{workspaceId}/members/{memberId}")
    public ResponseEntity<WorkspaceMemberResponse> updateMember(

            @PathVariable UUID workspaceId,

            @PathVariable UUID memberId,

            @Valid
            @RequestBody
            UpdateWorkspaceMemberRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                workspaceService.updateMember(
                        workspaceId,
                        memberId,
                        request,
                        user
                )
        );
    }

    @DeleteMapping("/{workspaceId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(

            @PathVariable UUID workspaceId,

            @PathVariable UUID memberId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        workspaceService.removeMember(
                workspaceId,
                memberId,
                user
        );

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> update(

            @PathVariable UUID workspaceId,

            @Valid
            @RequestBody
            UpdateWorkspaceRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                workspaceService.update(
                        workspaceId,
                        request,
                        user
                )
        );
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> delete(

            @PathVariable UUID workspaceId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        workspaceService.delete(
                workspaceId,
                user
        );

        return ResponseEntity.noContent().build();
    }
}