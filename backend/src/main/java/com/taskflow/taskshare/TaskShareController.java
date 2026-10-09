package com.taskflow.taskshare;

import com.taskflow.common.CurrentUser;
import com.taskflow.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskShareController {

    private final TaskShareService taskShareService;

    private final CurrentUser currentUser;


    @PostMapping("/tasks/{taskId}/shares")
    public ResponseEntity<TaskShareResponse> createShare(

            @PathVariable UUID taskId,

            @Valid
            @RequestBody
            TaskShareRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        taskShareService.createShare(
                                taskId,
                                request,
                                user
                        )
                );
    }


    @GetMapping("/tasks/{taskId}/shares")
    public ResponseEntity<Page<TaskShareResponse>> getTaskShares(

            @PathVariable UUID taskId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        Pageable pageable =
                PageRequest.of(
                        Math.max(page, 0),
                        Math.min(Math.max(size, 1), 100),
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                taskShareService.getTaskShares(
                        taskId,
                        user,
                        pageable
                )
        );
    }


    @DeleteMapping("/tasks/{taskId}/shares/{shareId}")
    public ResponseEntity<Void> revokeShare(

            @PathVariable UUID taskId,

            @PathVariable UUID shareId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        taskShareService.revokeShare(
                taskId,
                shareId,
                user
        );

        return ResponseEntity
                .noContent()
                .build();
    }


    @GetMapping("/tasks/shared-with-me")
    public ResponseEntity<Page<TaskShareResponse>> getSharedWithMe(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        Pageable pageable =
                PageRequest.of(
                        Math.max(page, 0),
                        Math.min(Math.max(size, 1), 100),
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                taskShareService.getSharedWithMe(
                        user,
                        pageable
                )
        );
    }


    @GetMapping("/tasks/{taskId}/my-share")
    public ResponseEntity<TaskShareResponse> getMyShare(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskShareService.getMyShare(
                        taskId,
                        user
                )
        );
    }
}