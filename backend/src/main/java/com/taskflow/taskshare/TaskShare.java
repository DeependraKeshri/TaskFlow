package com.taskflow.taskshare;

import com.taskflow.task.Task;
import com.taskflow.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "task_shares",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_task_share_task_user",
                        columnNames = {
                                "task_id",
                                "shared_with_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskShare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "task_id",
            nullable = false
    )
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "shared_with_id",
            nullable = false
    )
    private User sharedWith;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskSharePermission permission;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    public void beforeCreate() {

        if (createdAt == null) {
            createdAt = Instant.now();
        }

        if (permission == null) {
            permission =
                    TaskSharePermission.VIEW;
        }
    }
}