package com.taskflow.taskshare;

import com.taskflow.task.Task;
import com.taskflow.task.TaskRepository;
import com.taskflow.user.User;
import com.taskflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskShareService {

    private final TaskShareRepository taskShareRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskShareResponse createShare(UUID taskId, TaskShareRequest request, User owner) {
        Task task = getTask(taskId);
        ensureOwner(task, owner);
        if (Boolean.TRUE.equals(task.getLocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Locked tasks cannot be shared");
        }
        if (task.getCreatedBy() != null && task.getCreatedBy().getId().equals(request.userId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A task cannot be shared with its owner");
        }
        User sharedWith = userRepository.findById(request.userId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User to share with was not found"));
        if (taskShareRepository.existsByTaskIdAndSharedWithId(taskId, sharedWith.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This task is already shared with this user");
        }
        TaskShare share = TaskShare.builder().task(task).sharedWith(sharedWith).permission(request.permission()).build();
        return toResponse(taskShareRepository.save(share));
    }

    @Transactional(readOnly = true)
    public Page<TaskShareResponse> getTaskShares(UUID taskId, User owner, Pageable pageable) {
        Task task = getTask(taskId);
        ensureOwner(task, owner);
        return taskShareRepository.findByTaskId(taskId, pageable).map(this::toResponse);
    }

    public void revokeShare(UUID taskId, UUID shareId, User owner) {
        Task task = getTask(taskId);
        ensureOwner(task, owner);
        TaskShare share = taskShareRepository.findById(shareId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task share not found"));
        if (share.getTask() == null || !share.getTask().getId().equals(taskId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task share not found");
        }
        taskShareRepository.delete(share);
    }

    @Transactional(readOnly = true)
    public Page<TaskShareResponse> getSharedWithMe(User user, Pageable pageable) {
        return taskShareRepository.findBySharedWithId(user.getId(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskShareResponse getMyShare(UUID taskId, User user) {
        TaskShare share = taskShareRepository.findByTaskIdAndSharedWithId(taskId, user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You do not have a share for this task"));
        return toResponse(share);
    }

    private Task getTask(UUID taskId) {
        return taskRepository.findById(taskId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    private void ensureOwner(Task task, User user) {
        if (task.getCreatedBy() == null || !task.getCreatedBy().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the task owner can manage sharing");
        }
    }

    private TaskShareResponse toResponse(TaskShare share) {
        Task task = share.getTask();
        User sharedWith = share.getSharedWith();
        User sharedBy = task.getCreatedBy();
        return new TaskShareResponse(share.getId(), task.getId(), task.getTitle(), sharedWith.getId(), sharedWith.getName(), sharedWith.getEmail(), sharedBy != null ? sharedBy.getId() : null, sharedBy != null ? sharedBy.getName() : null, sharedBy != null ? sharedBy.getEmail() : null, share.getPermission(), share.getCreatedAt());
    }
}
