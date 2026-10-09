package com.taskflow.doodle;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TaskDoodleRepository extends JpaRepository<TaskDoodle, UUID> {
    Optional<TaskDoodle> findByTaskId(UUID taskId);
}
