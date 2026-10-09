package com.taskflow.attachment;

import com.taskflow.task.Task;
import com.taskflow.task.TaskRepository;
import com.taskflow.taskshare.TaskShare;
import com.taskflow.taskshare.TaskSharePermission;
import com.taskflow.taskshare.TaskShareRepository;
import com.taskflow.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 20L * 1024L * 1024L;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "svg",
            "pdf",
            "doc", "docx", "txt",
            "xls", "xlsx", "csv",
            "ppt", "pptx",
            "mp3", "wav", "m4a", "ogg",
            "mp4", "webm", "mov",
            "zip"
    );

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final TaskShareRepository taskShareRepository;

    @Value("${app.storage.upload-dir:uploads}")
    private String uploadDirectory;

    @Transactional(readOnly = true)
    public List<AttachmentResponse> list(UUID taskId, User user) {
        Task task = getTask(taskId);
        ensureCanView(task, user);

        return attachmentRepository
                .findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AttachmentResponse upload(
            UUID taskId,
            MultipartFile file,
            User user
    ) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select a file"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Maximum attachment size is 20 MB"
            );
        }

        Task task = getTask(taskId);
        ensureCanModify(task, user);

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? "attachment"
                        : file.getOriginalFilename()
        );

        if (originalName.contains("..")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file name"
            );
        }

        String extension = getExtension(originalName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File type is not supported"
            );
        }

        Path taskDirectory =
                getUploadRoot()
                        .resolve(taskId.toString())
                        .normalize();

        try {
            Files.createDirectories(taskDirectory);

            String storedName =
                    UUID.randomUUID() +
                            (extension.isBlank()
                                    ? ""
                                    : "." + extension);

            Path target =
                    taskDirectory
                            .resolve(storedName)
                            .normalize();

            if (!target.startsWith(taskDirectory)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid file path"
                );
            }

            Files.copy(
                    file.getInputStream(),
                    target
            );

            Attachment attachment =
                    Attachment.builder()
                            .task(task)
                            .uploadedBy(user)
                            .originalFileName(originalName)
                            .storedFileName(storedName)
                            .contentType(file.getContentType())
                            .fileSize(file.getSize())
                            .storagePath(target.toString())
                            .build();

            return toResponse(
                    attachmentRepository.save(attachment)
            );

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store attachment",
                    ex
            );
        }
    }

    @Transactional(readOnly = true)
    public AttachmentDownload download(
            UUID attachmentId,
            User user
    ) {
        Attachment attachment = getAttachment(attachmentId);

        ensureCanView(
                attachment.getTask(),
                user
        );

        try {
            Path path =
                    Paths.get(
                            attachment.getStoragePath()
                    )
                            .toAbsolutePath()
                            .normalize();

            Path root =
                    getUploadRoot()
                            .toAbsolutePath()
                            .normalize();

            if (!path.startsWith(root)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Invalid attachment path"
                );
            }

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (!resource.exists()
                    || !resource.isReadable()) {

                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Attachment file not found"
                );
            }

            String contentType =
                    attachment.getContentType();

            if (contentType == null
                    || contentType.isBlank()) {

                contentType =
                        Files.probeContentType(path);
            }

            if (contentType == null
                    || contentType.isBlank()) {

                contentType =
                        "application/octet-stream";
            }

            return new AttachmentDownload(
                    resource,
                    attachment.getOriginalFileName(),
                    contentType,
                    attachment.getFileSize()
            );

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Unable to read attachment",
                    ex
            );
        }
    }

    public void delete(
            UUID attachmentId,
            User user
    ) {
        Attachment attachment =
                getAttachment(attachmentId);

        ensureCanModify(
                attachment.getTask(),
                user
        );

        try {
            Path path =
                    Paths.get(
                            attachment.getStoragePath()
                    )
                            .toAbsolutePath()
                            .normalize();

            Path root =
                    getUploadRoot()
                            .toAbsolutePath()
                            .normalize();

            if (path.startsWith(root)) {
                Files.deleteIfExists(path);
            }

            attachmentRepository.delete(
                    attachment
            );

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to delete attachment",
                    ex
            );
        }
    }

    private Attachment getAttachment(
            UUID attachmentId
    ) {
        return attachmentRepository
                .findById(attachmentId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Attachment not found"
                        )
                );
    }

    private Task getTask(UUID taskId) {
        return taskRepository
                .findById(taskId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Task not found"
                        )
                );
    }

    /**
     * VIEW permission is enough to see/download attachments.
     *
     * Owners and assignees always have view access.
     * Shared users with any TaskSharePermission have view access.
     */
    private void ensureCanView(
            Task task,
            User user
    ) {
        if (isOwner(task, user)
                || isAssignee(task, user)) {
            return;
        }

        TaskShare share =
                findShare(task, user);

        if (share != null) {
            return;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have access to this task"
        );
    }

    /**
     * Upload/delete require modification permission.
     *
     * Owners and assignees can modify.
     * EDIT and FULL_ACCESS shared users can modify.
     * VIEW and COMMENT shared users cannot modify attachments.
     */
    private void ensureCanModify(
        Task task,
        User user
) {
    System.out.println(
            "[ATTACHMENT DEBUG] taskId=" + task.getId()
                    + ", userId=" + user.getId()
                    + ", userEmail=" + user.getEmail()
                    + ", locked=" + task.getLocked()
    );

    boolean owner =
            isOwner(task, user);

    boolean assignee =
            isAssignee(task, user);

    System.out.println(
            "[ATTACHMENT DEBUG] owner=" + owner
                    + ", assignee=" + assignee
    );

    if (Boolean.TRUE.equals(task.getLocked())) {
        System.out.println(
                "[ATTACHMENT DEBUG] REJECTED: task locked"
        );

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Task is locked"
        );
    }

    if (owner || assignee) {
        System.out.println(
                "[ATTACHMENT DEBUG] ALLOWED: owner/assignee"
        );

        return;
    }

    TaskShare share =
            findShare(task, user);

    System.out.println(
            "[ATTACHMENT DEBUG] share="
                    + (share == null
                    ? "NULL"
                    : "FOUND")
    );

    if (share == null) {
        System.out.println(
                "[ATTACHMENT DEBUG] REJECTED: no share"
        );

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have access to this task"
        );
    }

    TaskSharePermission permission =
            share.getPermission();

    System.out.println(
            "[ATTACHMENT DEBUG] permission="
                    + permission
    );

    if (permission != TaskSharePermission.EDIT
            && permission != TaskSharePermission.FULL_ACCESS) {

        System.out.println(
                "[ATTACHMENT DEBUG] REJECTED: insufficient permission"
        );

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You do not have permission to modify attachments"
        );
    }

    System.out.println(
            "[ATTACHMENT DEBUG] ALLOWED: "
                    + permission
    );
}

    private boolean isOwner(
            Task task,
            User user
    ) {
        return task.getCreatedBy() != null
                && task.getCreatedBy()
                        .getId()
                        .equals(user.getId());
    }

    private boolean isAssignee(
            Task task,
            User user
    ) {
        return task.getAssignedTo() != null
                && task.getAssignedTo()
                        .getId()
                        .equals(user.getId());
    }

    private TaskShare findShare(
            Task task,
            User user
    ) {
        return taskShareRepository
                .findByTaskIdAndSharedWithId(
                        task.getId(),
                        user.getId()
                )
                .orElse(null);
    }

    private Path getUploadRoot() {
        return Paths
                .get(uploadDirectory)
                .toAbsolutePath()
                .normalize();
    }

    private String getExtension(
            String fileName
    ) {
        int dot =
                fileName.lastIndexOf('.');

        if (dot < 0
                || dot == fileName.length() - 1) {
            return "";
        }

        return fileName
                .substring(dot + 1)
                .toLowerCase(Locale.ROOT);
    }

    private AttachmentResponse toResponse(
            Attachment attachment
    ) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getTask().getId(),
                attachment.getOriginalFileName(),
                attachment.getContentType(),
                attachment.getFileSize(),
                attachment.getCreatedAt()
        );
    }
}