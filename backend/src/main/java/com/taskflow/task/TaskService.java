package com.taskflow.task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskflow.project.Project;
import com.taskflow.project.ProjectRepository;
import com.taskflow.taskshare.TaskShare;
import com.taskflow.taskshare.TaskSharePermission;
import com.taskflow.taskshare.TaskShareRepository;
import com.taskflow.user.User;
import com.taskflow.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;
    private final TaskShareRepository taskShareRepository;

    public TaskResponse create(
            UUID projectId,
            CreateTaskRequest request,
            User user
    ) {

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Project not found"
                                )
                        );

        Task task = new Task();

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());

        task.setProject(project);
        task.setCreatedBy(user);

        task.setPinned(false);
        task.setLocked(false);
        task.setArchived(false);
        task.setDeletedAt(null);

        if (request.assignedTo() != null) {

            User assignedUser =
                    userRepository.findById(request.assignedTo())
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Assigned user not found"
                                    )
                            );

            task.setAssignedTo(assignedUser);
        }

        Task savedTask =
                taskRepository.save(task);

        return taskMapper.toResponse(savedTask);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(
            UUID projectId,
            String search,
            TaskStatus status,
            TaskPriority priority,
            UUID assignedTo,
            Boolean pinned,
            Boolean locked,
            LocalDate dueDateFrom,
            LocalDate dueDateTo,
            Pageable pageable
    ) {

        Specification<Task> specification =
                Specification
                        .where(TaskSpecification.projectId(projectId))
                        .and(TaskSpecification.activeTasks())
                        .and(TaskSpecification.search(search))
                        .and(TaskSpecification.status(status))
                        .and(TaskSpecification.priority(priority))
                        .and(TaskSpecification.assignedTo(assignedTo))
                        .and(TaskSpecification.pinned(pinned))
                        .and(TaskSpecification.locked(locked))
                        .and(TaskSpecification.dueDateFrom(dueDateFrom))
                        .and(TaskSpecification.dueDateTo(dueDateTo));

        Page<Task> tasks =
                taskRepository.findAll(
                        specification,
                        pageable
                );

        return tasks.map(taskMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(
            UUID taskId,
            User user
    ) {

        Task task =
                taskRepository.findById(taskId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Task not found"
                                )
                        );

        ensureCanView(task, user);

        return taskMapper.toResponse(task);
    }

    public TaskResponse update(
            UUID taskId,
            UpdateTaskRequest request,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModify(task, user);

        if (request.title() != null) {
            task.setTitle(request.title());
        }

        if (request.description() != null) {
            task.setDescription(
                    request.description()
            );
        }

        if (request.status() != null) {
            task.setStatus(
                    request.status()
            );
        }

        if (request.priority() != null) {
            task.setPriority(
                    request.priority()
            );
        }

        if (request.dueDate() != null) {
            task.setDueDate(
                    request.dueDate()
            );
        }

        if (request.position() != null) {
            task.setPosition(
                    request.position()
            );
        }

        if (request.assignedTo() != null) {

            User assignedUser =
                    userRepository.findById(
                            request.assignedTo()
                    )
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Assigned user not found"
                                    )
                            );

            task.setAssignedTo(
                    assignedUser
            );
        }

        return taskMapper.toResponse(
                taskRepository.save(task)
        );
    }

    public TaskResponse delete(
            UUID taskId,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModify(task, user);

        task.setDeletedAt(
                Instant.now()
        );

        return taskMapper.toResponse(
                taskRepository.save(task)
        );
    }

    public TaskResponse togglePin(
            UUID taskId,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModify(task, user);

        task.setPinned(
                !Boolean.TRUE.equals(
                        task.getPinned()
                )
        );

        return taskMapper.toResponse(
                taskRepository.save(task)
        );
    }

    public TaskResponse toggleLock(
            UUID taskId,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModifyLock(task, user);

        task.setLocked(
                !Boolean.TRUE.equals(
                        task.getLocked()
                )
        );

        return taskMapper.toResponse(
                taskRepository.save(task)
        );
    }

    public TaskResponse archive(
            UUID taskId,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModify(task, user);

        task.setArchived(true);

        return taskMapper.toResponse(
                taskRepository.save(task)
        );
    }

    public TaskResponse restoreArchive(
            UUID taskId,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModify(task, user);

        task.setArchived(false);

        return taskMapper.toResponse(
                taskRepository.save(task)
        );
    }

    public TaskResponse trash(
            UUID taskId,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModify(task, user);

        task.setDeletedAt(
                Instant.now()
        );

        return taskMapper.toResponse(
                taskRepository.save(task)
        );
    }

    public TaskResponse restore(
            UUID taskId,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModify(task, user);

        task.setDeletedAt(null);

        return taskMapper.toResponse(
                taskRepository.save(task)
        );
    }

    public void permanentlyDelete(
            UUID taskId,
            User user
    ) {

        Task task =
                getTaskEntity(taskId);

        ensureCanModify(task, user);

        taskRepository.delete(task);
    }

    public TaskResponse duplicate(
            UUID taskId,
            User user
    ) {

        Task original =
                getTaskEntity(taskId);

        ensureCanView(original, user);

        Task duplicate =
                new Task();

        duplicate.setTitle(
                original.getTitle() + " (Copy)"
        );

        duplicate.setDescription(
                original.getDescription()
        );

        duplicate.setStatus(
                original.getStatus()
        );

        duplicate.setPriority(
                original.getPriority()
        );

        duplicate.setDueDate(
                original.getDueDate()
        );

        duplicate.setPosition(
                original.getPosition() + 1
        );

        duplicate.setProject(
                original.getProject()
        );

        duplicate.setCreatedBy(
                user
        );

        duplicate.setAssignedTo(
                original.getAssignedTo()
        );

        duplicate.setPinned(false);
        duplicate.setLocked(false);
        duplicate.setArchived(false);
        duplicate.setDeletedAt(null);

        Task savedDuplicate =
                taskRepository.save(
                        duplicate
                );

        return taskMapper.toResponse(
                savedDuplicate
        );
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getArchivedTasks(
            User user,
            Pageable pageable
    ) {

        Page<Task> tasks =
                taskRepository
                        .findByArchivedTrueAndDeletedAtIsNullAndCreatedBy(
                                user,
                                pageable
                        );

        return tasks.map(
                taskMapper::toResponse
        );
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTrashTasks(
            User user,
            Pageable pageable
    ) {

        Page<Task> tasks =
                taskRepository
                        .findByDeletedAtIsNotNullAndCreatedBy(
                                user,
                                pageable
                        );

        return tasks.map(
                taskMapper::toResponse
        );
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTodayTasks(
            User user,
            Pageable pageable
    ) {

        LocalDate today =
                LocalDate.now();

        Page<Task> tasks =
                taskRepository.findTodayTasks(
                        user.getId(),
                        today,
                        pageable
                );

        return tasks.map(
                taskMapper::toResponse
        );
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getUpcomingTasks(
            User user,
            Pageable pageable
    ) {

        LocalDate today =
                LocalDate.now();

        Page<Task> tasks =
                taskRepository.findUpcomingTasks(
                        user.getId(),
                        today,
                        pageable
                );

        return tasks.map(
                taskMapper::toResponse
        );
    }

    private Task getTaskEntity(
            UUID taskId
    ) {

        return taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Task not found"
                        )
                );
    }

    private void ensureCanView(
            Task task,
            User user
    ) {

        if (
                task.getCreatedBy() != null &&
                task.getCreatedBy().getId()
                        .equals(user.getId())
        ) {
            return;
        }

        if (
                task.getAssignedTo() != null &&
                task.getAssignedTo().getId()
                        .equals(user.getId())
        ) {
            return;
        }

        TaskShare share =
                taskShareRepository
                        .findByTaskIdAndSharedWithId(
                                task.getId(),
                                user.getId()
                        )
                        .orElse(null);

        if (share != null) {
            return;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have access to this task"
        );
    }

    private void ensureCanModify(
            Task task,
            User user
    ) {

        ensureCanView(
                task,
                user
        );

        if (
                Boolean.TRUE.equals(
                        task.getLocked()
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Task is locked"
            );
        }

        if (
                task.getCreatedBy() != null &&
                task.getCreatedBy().getId()
                        .equals(user.getId())
        ) {
            return;
        }

        if (
                task.getAssignedTo() != null &&
                task.getAssignedTo().getId()
                        .equals(user.getId())
        ) {
            return;
        }

        TaskShare share =
                taskShareRepository
                        .findByTaskIdAndSharedWithId(
                                task.getId(),
                                user.getId()
                        )
                        .orElse(null);

        if (share == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to modify this task"
            );
        }

        if (
                share.getPermission() != TaskSharePermission.EDIT &&
                share.getPermission() != TaskSharePermission.FULL_ACCESS
        ) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to modify this task"
            );
        }
    }

    private void ensureCanModifyLock(
            Task task,
            User user
    ) {

        if (
                task.getCreatedBy() != null &&
                task.getCreatedBy().getId()
                        .equals(user.getId())
        ) {
            return;
        }

        TaskShare share =
                taskShareRepository
                        .findByTaskIdAndSharedWithId(
                                task.getId(),
                                user.getId()
                        )
                        .orElse(null);

        if (share != null &&
                share.getPermission() == TaskSharePermission.FULL_ACCESS) {
            return;
        }

        if (
                task.getAssignedTo() != null &&
                task.getAssignedTo().getId()
                        .equals(user.getId())
        ) {
            return;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have permission to lock or unlock this task"
        );
    }
}