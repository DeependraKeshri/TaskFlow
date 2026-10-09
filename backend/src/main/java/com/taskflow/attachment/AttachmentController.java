package com.taskflow.attachment;

import com.taskflow.common.CurrentUser;
import com.taskflow.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final CurrentUser currentUser;

    @GetMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> list(
            @PathVariable UUID taskId,
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);

        return ResponseEntity.ok(
                attachmentService.list(taskId, user)
        );
    }

    @PostMapping(
            value = "/tasks/{taskId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AttachmentResponse> upload(
            @PathVariable UUID taskId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);

        return ResponseEntity.status(201).body(
                attachmentService.upload(taskId, file, user)
        );
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable UUID attachmentId,
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);
        AttachmentDownload download =
                attachmentService.download(attachmentId, user);

        ContentDisposition disposition = ContentDisposition
                .inline()
                .filename(
                        download.fileName(),
                        StandardCharsets.UTF_8
                )
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .contentLength(download.fileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(download.resource());
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID attachmentId,
            Authentication authentication
    ) {
        User user = currentUser.get(authentication);
        attachmentService.delete(attachmentId, user);

        return ResponseEntity.noContent().build();
    }
}
