package com.taskflow.doodle;

import jakarta.validation.constraints.NotBlank;

public record TaskDoodleRequest(
        @NotBlank(message = "Doodle image data is required")
        String imageData
) {
}
