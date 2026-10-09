package com.taskflow.taskblock;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TaskBlockRepository extends JpaRepository<TaskBlock, UUID> {
    List<TaskBlock> findByTaskIdOrderByPositionAsc(UUID taskId);
    void deleteByTaskId(UUID taskId);
}
