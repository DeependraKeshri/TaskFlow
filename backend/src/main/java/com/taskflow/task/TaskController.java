package com.taskflow.task;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskflow.common.CurrentUser;
import com.taskflow.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    private final CurrentUser currentUser;

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> createTask(

            @PathVariable UUID projectId,

            @Valid
            @RequestBody
            CreateTaskRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        TaskResponse response =
                taskService.create(
                        projectId,
                        request,
                        user
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<Page<TaskResponse>> getTasks(

            @PathVariable UUID projectId,

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            TaskStatus status,

            @RequestParam(required = false)
            TaskPriority priority,

            @RequestParam(required = false)
            UUID assignedTo,

            @RequestParam(required = false)
            Boolean pinned,

            @RequestParam(required = false)
            Boolean locked,

            @RequestParam(required = false)
            LocalDate dueDateFrom,

            @RequestParam(required = false)
            LocalDate dueDateTo,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction
    ) {

        Sort.Direction sortDirection =
                direction.equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable =
                PageRequest.of(
                        Math.max(page, 0),
                        Math.min(Math.max(size, 1), 100),
                        Sort.by(
                                sortDirection,
                                sortBy
                        )
                );

        return ResponseEntity.ok(
                taskService.getTasks(
                        projectId,
                        search,
                        status,
                        priority,
                        assignedTo,
                        pinned,
                        locked,
                        dueDateFrom,
                        dueDateTo,
                        pageable
                )
        );
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTask(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskService.getTask(
                        taskId,
                        user
                )
        );
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(

            @PathVariable UUID taskId,

            @Valid
            @RequestBody
            UpdateTaskRequest request,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskService.update(
                        taskId,
                        request,
                        user
                )
        );
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        taskService.delete(
                taskId,
                user
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    @PatchMapping("/tasks/{taskId}/pin")
    public ResponseEntity<TaskResponse> togglePin(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskService.togglePin(
                        taskId,
                        user
                )
        );
    }

    @PatchMapping("/tasks/{taskId}/lock")
    public ResponseEntity<TaskResponse> toggleLock(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskService.toggleLock(
                        taskId,
                        user
                )
        );
    }

    @PatchMapping("/tasks/{taskId}/archive")
    public ResponseEntity<TaskResponse> archive(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskService.archive(
                        taskId,
                        user
                )
        );
    }

    @PatchMapping("/tasks/{taskId}/restore-archive")
    public ResponseEntity<TaskResponse> restoreArchive(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskService.restoreArchive(
                        taskId,
                        user
                )
        );
    }

    @PatchMapping("/tasks/{taskId}/trash")
    public ResponseEntity<TaskResponse> trash(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskService.trash(
                        taskId,
                        user
                )
        );
    }

    @PatchMapping("/tasks/{taskId}/restore")
    public ResponseEntity<TaskResponse> restore(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity.ok(
                taskService.restore(
                        taskId,
                        user
                )
        );
    }

    @DeleteMapping("/tasks/{taskId}/permanent")
    public ResponseEntity<Void> permanentlyDelete(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        taskService.permanentlyDelete(
                taskId,
                user
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    @PostMapping("/tasks/{taskId}/duplicate")
    public ResponseEntity<TaskResponse> duplicate(

            @PathVariable UUID taskId,

            Authentication authentication
    ) {

        User user =
                currentUser.get(authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        taskService.duplicate(
                                taskId,
                                user
                        )
                );
    }

    @GetMapping("/tasks/today")
    public ResponseEntity<Page<TaskResponse>> getTodayTasks(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "50")
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
                                Sort.Direction.ASC,
                                "dueDate"
                        )
                );

        return ResponseEntity.ok(
                taskService.getTodayTasks(
                        user,
                        pageable
                )
        );
    }

    @GetMapping("/tasks/upcoming")
    public ResponseEntity<Page<TaskResponse>> getUpcomingTasks(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "50")
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
                                Sort.Direction.ASC,
                                "dueDate"
                        )
                );

        return ResponseEntity.ok(
                taskService.getUpcomingTasks(
                        user,
                        pageable
                )
        );
    }

    @GetMapping("/tasks/archived")
    public ResponseEntity<Page<TaskResponse>> getArchivedTasks(

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
                taskService.getArchivedTasks(
                        user,
                        pageable
                )
        );
    }

    @GetMapping("/tasks/trash")
    public ResponseEntity<Page<TaskResponse>> getTrashTasks(

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
                                "deletedAt"
                        )
                );

        return ResponseEntity.ok(
                taskService.getTrashTasks(
                        user,
                        pageable
                )
        );
    }
}
