package com.taskflow.notification;

import com.taskflow.common.CurrentUser;
import com.taskflow.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        User user = currentUser.get(authentication);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Page<NotificationResponse> response =
                notificationRepository
                        .findByRecipientIdOrderByCreatedAtDesc(
                                user.getId(),
                                PageRequest.of(
                                        safePage,
                                        safeSize,
                                        Sort.by(Sort.Direction.DESC, "createdAt")
                                )
                        )
                        .map(this::toResponse);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);

        return ResponseEntity.ok(
                notificationRepository.countByRecipientIdAndReadFalse(user.getId())
        );
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            Authentication authentication,
            @PathVariable UUID notificationId
    ) {
        User user = currentUser.get(authentication);

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException("Notification not found")
                        );

        if (!notification.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        if (!Boolean.TRUE.equals(notification.getRead())) {
            notification.setRead(true);
            notification.setReadAt(java.time.Instant.now());
            notificationRepository.save(notification);
        }

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);

        var notifications =
                notificationRepository.findByRecipientIdAndReadFalse(user.getId());

        java.time.Instant now = java.time.Instant.now();

        notifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(now);
        });

        notificationRepository.saveAll(notifications);

        return ResponseEntity.noContent().build();
    }

    private NotificationResponse toResponse(Notification notification) {

        User actor = notification.getActor();

        return new NotificationResponse(
                notification.getId(),
                notification.getRecipient().getId(),
                actor != null ? actor.getId() : null,
                actor != null ? actor.getName() : null,
                notification.getTask() != null
                        ? notification.getTask().getId()
                        : null,
                notification.getTask() != null
                        ? notification.getTask().getTitle()
                        : null,
                notification.getCommentId(),
                notification.getType(),
                notification.getMessage(),
                Boolean.TRUE.equals(notification.getRead()),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}