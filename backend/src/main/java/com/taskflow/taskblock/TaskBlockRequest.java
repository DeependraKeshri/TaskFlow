package com.taskflow.taskblock;

import jakarta.validation.constraints.NotNull;

public record TaskBlockRequest(
    @NotNull TaskBlockType blockType,
    String content,
    Integer position
) {}
