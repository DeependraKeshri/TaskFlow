package com.taskflow.comment;

import com.taskflow.common.CurrentUser;
import com.taskflow.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskCommentController {

    private final TaskCommentService commentService;
    private final CurrentUser currentUser;

    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<TaskCommentResponse> createComment(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskCommentRequest request,
            Authentication authentication) {

        User user = currentUser.get(authentication);

        return ResponseEntity
                .status(201)
                .body(commentService.create(taskId, request, user));
    }

    @GetMapping("/tasks/{taskId}/comments")
    public ResponseEntity<Page<TaskCommentResponse>> getComments(
            @PathVariable UUID taskId,
            Pageable pageable,
            Authentication authentication) {

        User user = currentUser.get(authentication);

        return ResponseEntity.ok(
                commentService.getComments(taskId, user, pageable)
        );
    }

    @PatchMapping("/tasks/comments/{commentId}")
    public ResponseEntity<TaskCommentResponse> updateComment(
            @PathVariable UUID commentId,
            @Valid @RequestBody TaskCommentRequest request,
            Authentication authentication) {

        User user = currentUser.get(authentication);

        return ResponseEntity.ok(
                commentService.update(commentId, request, user)
        );
    }

    @DeleteMapping("/tasks/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            Authentication authentication) {

        User user = currentUser.get(authentication);

        commentService.delete(commentId, user);

        return ResponseEntity.noContent().build();
    }
}