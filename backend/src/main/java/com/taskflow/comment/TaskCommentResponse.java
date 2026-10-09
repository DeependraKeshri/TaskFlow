package com.taskflow.comment;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TaskCommentResponse(

        UUID id,

        UUID taskId,

        UUID authorId,

        String authorName,

        String authorEmail,

        UUID parentCommentId,

        String content,

        Instant createdAt,

        Instant updatedAt,

        List<TaskCommentResponse> replies
) {
}