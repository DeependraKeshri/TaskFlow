package com.taskflow.taskshare;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TaskShareRepository
        extends JpaRepository<TaskShare, UUID> {

    boolean existsByTaskIdAndSharedWithId(
            UUID taskId,
            UUID sharedWithId
    );

    Optional<TaskShare> findByTaskIdAndSharedWithId(
            UUID taskId,
            UUID sharedWithId
    );

    Page<TaskShare> findByTaskId(
            UUID taskId,
            Pageable pageable
    );

    Page<TaskShare> findBySharedWithId(
            UUID userId,
            Pageable pageable
    );

    long countByTaskId(
            UUID taskId
    );
}