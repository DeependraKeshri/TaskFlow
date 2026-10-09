package com.taskflow.comment;

import com.taskflow.notification.Notification;
import com.taskflow.notification.NotificationRepository;
import com.taskflow.notification.NotificationType;
import com.taskflow.task.Task;
import com.taskflow.task.TaskRepository;
import com.taskflow.task.TaskService;
import com.taskflow.taskshare.TaskShare;
import com.taskflow.taskshare.TaskSharePermission;
import com.taskflow.taskshare.TaskShareRepository;
import com.taskflow.user.User;
import com.taskflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final TaskService taskService;
    private final TaskShareRepository taskShareRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private static final Pattern MENTION_PATTERN =
            Pattern.compile("@([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})");

    private Task getTask(UUID taskId, User currentUser) {
        taskService.getTask(taskId, currentUser);

        return taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found"));
    }

    public TaskCommentResponse create(
            UUID taskId,
            TaskCommentRequest request,
            User currentUser
    ) {
        Task task = getTask(taskId, currentUser);

        TaskComment parent = null;

        if (request.parentCommentId() != null) {
            parent = commentRepository.findById(request.parentCommentId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Parent comment not found"));

            if (!parent.getTask().getId().equals(taskId)) {
                throw new IllegalArgumentException(
                        "Parent comment does not belong to this task"
                );
            }
        }

        TaskComment comment = TaskComment.builder()
                .task(task)
                .author(currentUser)
                .parent(parent)
                .content(request.content().trim())
                .build();

        comment = commentRepository.save(comment);

        createNotifications(task, comment, currentUser, parent);

        return toResponse(comment);
    }

    @Transactional(readOnly = true)
    public Page<TaskCommentResponse> getComments(
            UUID taskId,
            User currentUser,
            Pageable pageable
    ) {
        Task task = getTask(taskId, currentUser);

        return commentRepository
                .findByTaskIdAndParentIsNullOrderByCreatedAtAsc(
                        task.getId(),
                        pageable
                )
                .map(this::toResponse);
    }

    public TaskCommentResponse update(
            UUID commentId,
            TaskCommentRequest request,
            User currentUser
    ) {
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Comment not found"));

        UUID taskId = comment.getTask().getId();

        getTask(taskId, currentUser);

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException(
                    "Only the comment author can edit the comment"
            );
        }

        comment.setContent(request.content().trim());

        return toResponse(commentRepository.save(comment));
    }

    public void delete(
            UUID commentId,
            User currentUser
    ) {
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Comment not found"));

        UUID taskId = comment.getTask().getId();

        getTask(taskId, currentUser);

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException(
                    "Only the comment author can delete the comment"
            );
        }

        commentRepository.delete(comment);
    }

    private void createNotifications(
            Task task,
            TaskComment comment,
            User actor,
            TaskComment parent
    ) {
        Set<UUID> notifiedUserIds = new HashSet<>();

        /*
         * Reply notification.
         */
        if (parent != null) {
            User parentAuthor = parent.getAuthor();

            if (parentAuthor != null
                    && !parentAuthor.getId().equals(actor.getId())) {

                saveNotification(
                        parentAuthor,
                        actor,
                        task,
                        comment,
                        NotificationType.COMMENT_REPLY,
                        actor.getName() + " replied to your comment"
                );

                notifiedUserIds.add(parentAuthor.getId());
            }
        }

        /*
         * New comment notification for task owner.
         */
        User owner = task.getCreatedBy();

        if (owner != null
                && !owner.getId().equals(actor.getId())
                && notifiedUserIds.add(owner.getId())) {

            saveNotification(
                    owner,
                    actor,
                    task,
                    comment,
                    NotificationType.TASK_COMMENT,
                    actor.getName() + " commented on your task"
            );
        }

        /*
         * New comment notification for assigned user.
         */
        User assigned = task.getAssignedTo();

        if (assigned != null
                && !assigned.getId().equals(actor.getId())
                && notifiedUserIds.add(assigned.getId())) {

            saveNotification(
                    assigned,
                    actor,
                    task,
                    comment,
                    NotificationType.TASK_COMMENT,
                    actor.getName() + " commented on a task assigned to you"
            );
        }

        /*
         * New comment notifications for users the task is shared with.
         *
         * COMMENT, EDIT and FULL_ACCESS users can participate
         * in the task, so they should be notified when another
         * user adds a comment.
         */
        List<TaskShare> shares = taskShareRepository
                .findByTaskId(task.getId(), Pageable.unpaged())
                .getContent();

        for (TaskShare share : shares) {
            User sharedUser = share.getSharedWith();

            if (sharedUser == null
                    || sharedUser.getId().equals(actor.getId())
                    || notifiedUserIds.contains(sharedUser.getId())) {
                continue;
            }

            TaskSharePermission permission = share.getPermission();

            if (permission == TaskSharePermission.COMMENT
                    || permission == TaskSharePermission.EDIT
                    || permission == TaskSharePermission.FULL_ACCESS) {

                notifiedUserIds.add(sharedUser.getId());

                saveNotification(
                        sharedUser,
                        actor,
                        task,
                        comment,
                        NotificationType.TASK_COMMENT,
                        actor.getName() + " commented on a task shared with you"
                );
            }
        }

        /*
         * Mention notifications.
         *
         * Mentions use the user's email:
         *
         * @user@example.com
         */
        Set<String> mentionedEmails =
                extractMentionEmails(comment.getContent());

        for (String email : mentionedEmails) {
            userRepository.findByEmail(email)
                    .ifPresent(mentionedUser -> {

                        if (!mentionedUser.getId().equals(actor.getId())
                                && notifiedUserIds.add(mentionedUser.getId())) {

                            saveNotification(
                                    mentionedUser,
                                    actor,
                                    task,
                                    comment,
                                    NotificationType.COMMENT_MENTION,
                                    actor.getName() + " mentioned you in a comment"
                            );
                        }
                    });
        }
    }

    private Set<String> extractMentionEmails(String content) {
        Set<String> emails = new HashSet<>();

        Matcher matcher = MENTION_PATTERN.matcher(content);

        while (matcher.find()) {
            emails.add(matcher.group(1));
        }

        return emails;
    }

    private void saveNotification(
            User recipient,
            User actor,
            Task task,
            TaskComment comment,
            NotificationType type,
            String message
    ) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .task(task)
                .commentId(comment.getId())
                .type(type)
                .message(message)
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    private TaskCommentResponse toResponse(TaskComment comment) {
        List<TaskCommentResponse> replies =
                commentRepository
                        .findByParentIdOrderByCreatedAtAsc(comment.getId())
                        .stream()
                        .map(this::toResponse)
                        .toList();

        User author = comment.getAuthor();

        return new TaskCommentResponse(
                comment.getId(),
                comment.getTask().getId(),
                author.getId(),
                author.getName(),
                author.getEmail(),
                comment.getParent() != null
                        ? comment.getParent().getId()
                        : null,
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replies
        );
    }
}