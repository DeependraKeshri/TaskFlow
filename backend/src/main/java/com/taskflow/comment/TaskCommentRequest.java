package com.taskflow.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TaskCommentRequest(

        @NotBlank(message = "Comment content is required")
        @Size(max = 10000, message = "Comment cannot exceed 10000 characters")
        String content,

        UUID parentCommentId
) {
}