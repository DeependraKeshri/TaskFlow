package com.taskflow.task;

import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponse toResponse(
            Task task
    ) {

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),

                task.getProject().getId(),
                task.getProject().getName(),

                task.getCreatedBy().getId(),
                task.getCreatedBy().getName(),

                task.getAssignedTo() != null
                        ? task.getAssignedTo().getId()
                        : null,

                task.getAssignedTo() != null
                        ? task.getAssignedTo().getName()
                        : null,

                task.getDueDate(),
                task.getPosition(),

                task.getPinned(),
                task.getLocked(),
                task.getArchived(),
                task.getDeletedAt(),

                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}