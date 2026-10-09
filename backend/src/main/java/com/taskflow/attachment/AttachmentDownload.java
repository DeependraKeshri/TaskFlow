package com.taskflow.attachment;

import org.springframework.core.io.Resource;

public record AttachmentDownload(
        Resource resource,
        String fileName,
        String contentType,
        long fileSize
) {
}
