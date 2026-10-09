package com.taskflow.task;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.taskflow.user.User;

public interface TaskRepository
        extends JpaRepository<Task, UUID>,
                JpaSpecificationExecutor<Task> {

    /*
     * =========================================================
     * NORMAL TASK BOARD
     * =========================================================
     */

    Page<Task> findByProjectIdAndDeletedAtIsNullAndArchivedFalse(
            UUID projectId,
            Pageable pageable
    );

    Page<Task> findByProjectIdAndDeletedAtIsNullAndArchivedFalseAndStatus(
            UUID projectId,
            TaskStatus status,
            Pageable pageable
    );

    Page<Task> findByProjectIdAndDeletedAtIsNullAndArchivedFalseAndPriority(
            UUID projectId,
            TaskPriority priority,
            Pageable pageable
    );

    Page<Task> findByProjectIdAndDeletedAtIsNullAndArchivedFalseAndTitleContainingIgnoreCase(
            UUID projectId,
            String title,
            Pageable pageable
    );

    Page<Task> findByProjectIdAndDeletedAtIsNullAndArchivedFalseAndStatusAndPriority(
            UUID projectId,
            TaskStatus status,
            TaskPriority priority,
            Pageable pageable
    );

    Page<Task> findByProjectIdAndDeletedAtIsNullAndArchivedFalseAndStatusAndTitleContainingIgnoreCase(
            UUID projectId,
            TaskStatus status,
            String title,
            Pageable pageable
    );

    Page<Task> findByProjectIdAndDeletedAtIsNullAndArchivedFalseAndPriorityAndTitleContainingIgnoreCase(
            UUID projectId,
            TaskPriority priority,
            String title,
            Pageable pageable
    );

    Page<Task> findByProjectIdAndDeletedAtIsNullAndArchivedFalseAndStatusAndPriorityAndTitleContainingIgnoreCase(
            UUID projectId,
            TaskStatus status,
            TaskPriority priority,
            String title,
            Pageable pageable
    );


    /*
     * =========================================================
     * ASSIGNED TASKS
     * =========================================================
     */
/*
 * =========================================================
 * TODAY / UPCOMING TASKS
 * =========================================================
 */

@Query("""
        SELECT t
        FROM Task t
        WHERE
            (t.createdBy.id = :userId
             OR t.assignedTo.id = :userId)
            AND t.deletedAt IS NULL
            AND t.archived = false
            AND t.dueDate = :date
        """)
Page<Task> findTodayTasks(
        UUID userId,
        LocalDate date,
        Pageable pageable
);

@Query("""
        SELECT t
        FROM Task t
        WHERE
            (t.createdBy.id = :userId
             OR t.assignedTo.id = :userId)
            AND t.deletedAt IS NULL
            AND t.archived = false
            AND t.dueDate > :date
        """)
Page<Task> findUpcomingTasks(
        UUID userId,
        LocalDate date,
        Pageable pageable
);
    Page<Task> findByAssignedToId(
            UUID userId,
            Pageable pageable
    );


    /*
     * =========================================================
     * ARCHIVED TASKS
     * =========================================================
     *
     * Only tasks created by the current user are shown
     * in the user's Archive page.
     */

    Page<Task> findByArchivedTrueAndDeletedAtIsNullAndCreatedBy(
            User createdBy,
            Pageable pageable
    );


    /*
     * =========================================================
     * TRASHED TASKS
     * =========================================================
     *
     * Only tasks created by the current user are shown
     * in the user's Trash page.
     */

    Page<Task> findByDeletedAtIsNotNullAndCreatedBy(
            User createdBy,
            Pageable pageable
    );


    /*
     * =========================================================
     * PROJECT ARCHIVE / TRASH
     * =========================================================
     */

    Page<Task> findByProjectIdAndArchivedTrueAndDeletedAtIsNull(
            UUID projectId,
            Pageable pageable
    );

    Page<Task> findByProjectIdAndDeletedAtIsNotNull(
            UUID projectId,
            Pageable pageable
    );


    /*
     * =========================================================
     * COUNTS
     * =========================================================
     */

    long countByProjectId(
            UUID projectId
    );

    long countByProjectIdAndStatus(
            UUID projectId,
            TaskStatus status
    );
}