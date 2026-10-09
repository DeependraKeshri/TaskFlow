package com.taskflow.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskCommentRepository extends JpaRepository<TaskComment, UUID> {

    Page<TaskComment> findByTaskIdAndParentIsNullOrderByCreatedAtAsc(
            UUID taskId,
            Pageable pageable
    );

    java.util.List<TaskComment> findByParentIdOrderByCreatedAtAsc(UUID parentId);

    long countByTaskId(UUID taskId);
}