package com.taskflow.task;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

public class TaskSpecification {

    private TaskSpecification() {
    }

    public static Specification<Task> projectId(UUID projectId) {
        return (root, query, cb) ->
                cb.equal(
                        root.get("project").get("id"),
                        projectId
                );
    }

    public static Specification<Task> activeTasks() {
        return (root, query, cb) ->
                cb.and(
                        cb.isNull(root.get("deletedAt")),
                        cb.isFalse(root.get("archived"))
                );
    }

    public static Specification<Task> search(String search) {
        return (root, query, cb) -> {

            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }

            String value = "%" + search.trim().toLowerCase() + "%";

            return cb.or(
                    cb.like(
                            cb.lower(root.get("title")),
                            value
                    ),
                    cb.like(
                            cb.lower(root.get("description")),
                            value
                    )
            );
        };
    }

    public static Specification<Task> status(TaskStatus status) {
        return (root, query, cb) -> {

            if (status == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("status"),
                    status
            );
        };
    }

    public static Specification<Task> priority(TaskPriority priority) {
        return (root, query, cb) -> {

            if (priority == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("priority"),
                    priority
            );
        };
    }

    public static Specification<Task> assignedTo(UUID userId) {
        return (root, query, cb) -> {

            if (userId == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("assignedTo").get("id"),
                    userId
            );
        };
    }

    public static Specification<Task> pinned(Boolean pinned) {
        return (root, query, cb) -> {

            if (pinned == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("pinned"),
                    pinned
            );
        };
    }

    public static Specification<Task> locked(Boolean locked) {
        return (root, query, cb) -> {

            if (locked == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("locked"),
                    locked
            );
        };
    }

    public static Specification<Task> dueDateFrom(LocalDate date) {
        return (root, query, cb) -> {

            if (date == null) {
                return cb.conjunction();
            }

            return cb.greaterThanOrEqualTo(
                    root.get("dueDate"),
                    date
            );
        };
    }

    public static Specification<Task> dueDateTo(LocalDate date) {
        return (root, query, cb) -> {

            if (date == null) {
                return cb.conjunction();
            }

            return cb.lessThanOrEqualTo(
                    root.get("dueDate"),
                    date
            );
        };
    }
}