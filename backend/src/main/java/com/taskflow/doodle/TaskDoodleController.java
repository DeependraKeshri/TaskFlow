package com.taskflow.doodle;

import com.taskflow.common.CurrentUser;
import com.taskflow.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskDoodleController {

    private final TaskDoodleService doodleService;
    private final CurrentUser currentUser;

    @GetMapping("/tasks/{taskId}/doodle")
    public ResponseEntity<TaskDoodleResponse> get(
            @PathVariable UUID taskId,
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);

        TaskDoodleResponse response =
                doodleService.get(taskId, user);

        if (response == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/tasks/{taskId}/doodle")
    public ResponseEntity<TaskDoodleResponse> save(
            @PathVariable UUID taskId,
            @RequestBody TaskDoodleRequest request,
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);

        return ResponseEntity.ok(
                doodleService.save(taskId, request, user)
        );
    }

    @DeleteMapping("/tasks/{taskId}/doodle")
    public ResponseEntity<Void> delete(
            @PathVariable UUID taskId,
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);

        doodleService.delete(taskId, user);

        return ResponseEntity.noContent().build();
    }
}