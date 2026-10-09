package com.taskflow.doodle;

import com.taskflow.task.Task;
import com.taskflow.task.TaskRepository;
import com.taskflow.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskDoodleService {

    private final TaskDoodleRepository doodleRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public TaskDoodleResponse get(UUID taskId, User user) {
        Task task = getTask(taskId);
        ensureCanView(task, user);

        return doodleRepository.findByTaskId(taskId)
                .map(this::toResponse)
                .orElse(null);
    }

    public TaskDoodleResponse save(UUID taskId, TaskDoodleRequest request, User user) {
        Task task = getTask(taskId);
        ensureCanModify(task, user);

        TaskDoodle doodle = doodleRepository.findByTaskId(taskId)
                .orElseGet(() -> TaskDoodle.builder()
                        .task(task)
                        .build());

        doodle.setImageData(request.imageData());

        return toResponse(doodleRepository.save(doodle));
    }

    public void delete(UUID taskId, User user) {
        Task task = getTask(taskId);
        ensureCanModify(task, user);
        doodleRepository.findByTaskId(taskId).ifPresent(doodleRepository::delete);
    }

    private Task getTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Task not found"
                ));
    }

    private void ensureCanView(Task task, User user) {
        boolean creator = task.getCreatedBy() != null
                && task.getCreatedBy().getId().equals(user.getId());

        boolean assignee = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(user.getId());

        if (!creator && !assignee) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this task"
            );
        }
    }

    private void ensureCanModify(Task task, User user) {
        ensureCanView(task, user);

        if (Boolean.TRUE.equals(task.getLocked())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Task is locked"
            );
        }
    }

    private TaskDoodleResponse toResponse(TaskDoodle doodle) {
        return new TaskDoodleResponse(
                doodle.getId(),
                doodle.getTask().getId(),
                doodle.getImageData(),
                doodle.getCreatedAt(),
                doodle.getUpdatedAt()
        );
    }
}
