package com.taskflow.taskblock;

import com.taskflow.task.Task;
import com.taskflow.task.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskBlockService {

    private final TaskBlockRepository taskBlockRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<TaskBlockResponse> getBlocks(UUID taskId) {
        getTask(taskId);
        return taskBlockRepository.findByTaskIdOrderByPositionAsc(taskId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TaskBlockResponse createBlock(UUID taskId, TaskBlockRequest request) {
        Task task = getEditableTask(taskId);

        TaskBlock block = TaskBlock.builder()
                .task(task)
                .blockType(request.blockType())
                .content(request.content())
                .position(request.position() == null ? 0 : request.position())
                .build();

        return toResponse(taskBlockRepository.save(block));
    }

    public TaskBlockResponse updateBlock(UUID blockId, TaskBlockRequest request) {
        TaskBlock block = taskBlockRepository.findById(blockId)
                .orElseThrow(() -> new EntityNotFoundException("Task block not found: " + blockId));

        checkLocked(block.getTask());

        block.setBlockType(request.blockType());
        block.setContent(request.content());
        if (request.position() != null) {
            block.setPosition(request.position());
        }

        return toResponse(taskBlockRepository.save(block));
    }

    public void deleteBlock(UUID blockId) {
        TaskBlock block = taskBlockRepository.findById(blockId)
                .orElseThrow(() -> new EntityNotFoundException("Task block not found: " + blockId));

        checkLocked(block.getTask());
        taskBlockRepository.delete(block);
    }

    public List<TaskBlockResponse> replaceBlocks(UUID taskId, List<TaskBlockRequest> requests) {
        Task task = getEditableTask(taskId);

        taskBlockRepository.deleteByTaskId(taskId);

        List<TaskBlock> blocks = new java.util.ArrayList<>();

        for (int i = 0; i < requests.size(); i++) {
            TaskBlockRequest request = requests.get(i);
            TaskBlock block = TaskBlock.builder()
                    .task(task)
                    .blockType(request.blockType())
                    .content(request.content())
                    .position(request.position() == null ? i : request.position())
                    .build();
            blocks.add(block);
        }

        return taskBlockRepository.saveAll(blocks)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Task getTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
    }

    private Task getEditableTask(UUID taskId) {
        Task task = getTask(taskId);
        checkLocked(task);
        return task;
    }

    private void checkLocked(Task task) {
        if (Boolean.TRUE.equals(task.getLocked())) {
            throw new IllegalStateException("Task is locked and cannot be modified");
        }
    }

    private TaskBlockResponse toResponse(TaskBlock block) {
        return new TaskBlockResponse(
                block.getId(),
                block.getTask().getId(),
                block.getBlockType(),
                block.getContent(),
                block.getPosition(),
                block.getCreatedAt(),
                block.getUpdatedAt()
        );
    }
}
