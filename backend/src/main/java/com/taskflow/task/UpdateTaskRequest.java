package com.taskflow.task;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskRequest(

        @Size(max = 200)
        String title,

        @Size(max = 5000)
        String description,

        TaskStatus status,

        TaskPriority priority,

        LocalDate dueDate,

        UUID assignedTo,

        Integer position
) {
}