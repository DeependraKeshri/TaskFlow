package com.taskflow.taskblock;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class TaskBlockController {

    private final TaskBlockService taskBlockService;

    @GetMapping("/api/v1/tasks/{taskId}/blocks")
    public List<TaskBlockResponse> getBlocks(@PathVariable UUID taskId) {
        return taskBlockService.getBlocks(taskId);
    }

    @PostMapping("/api/v1/tasks/{taskId}/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskBlockResponse createBlock(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskBlockRequest request) {
        return taskBlockService.createBlock(taskId, request);
    }

    @PutMapping("/api/v1/task-blocks/{blockId}")
    public TaskBlockResponse updateBlock(
            @PathVariable UUID blockId,
            @Valid @RequestBody TaskBlockRequest request) {
        return taskBlockService.updateBlock(blockId, request);
    }

    @DeleteMapping("/api/v1/task-blocks/{blockId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBlock(@PathVariable UUID blockId) {
        taskBlockService.deleteBlock(blockId);
    }

    @PutMapping("/api/v1/tasks/{taskId}/blocks")
    public List<TaskBlockResponse> replaceBlocks(
            @PathVariable UUID taskId,
            @RequestBody List<@Valid TaskBlockRequest> requests) {
        return taskBlockService.replaceBlocks(taskId, requests);
    }
}
