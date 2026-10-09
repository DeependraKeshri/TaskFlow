import { useEffect, useRef, useState } from "react";
import {
  deleteAttachment,
  downloadAttachment,
  getTaskAttachments,
  uploadTaskAttachment,
} from "../api/attachmentApi";
import type { Attachment } from "../types/attachment";

interface TaskAttachmentsProps {
  taskId: string;
  locked?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function canPreview(contentType: string | null): boolean {
  return Boolean(
    contentType &&
      (contentType.startsWith("image/") ||
        contentType === "application/pdf" ||
        contentType.startsWith("text/"))
  );
}

export default function TaskAttachments({
  taskId,
  locked = false,
}: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function loadAttachments() {
    try {
      setError("");
      const data = await getTaskAttachments(taskId);
      setAttachments(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load attachments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAttachments();
  }, [taskId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || locked) return;

    setUploading(true);
    setError("");

    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `File "${file.name}" is larger than 20 MB.`
          );
        }

        const uploaded = await uploadTaskAttachment(taskId, file);

        setAttachments((current) => [uploaded, ...current]);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload attachment."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handlePreview(attachment: Attachment) {
    try {
      const blob = await downloadAttachment(attachment.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60_000);
    } catch (err) {
      console.error(err);
      setError("Unable to preview attachment.");
    }
  }

  async function handleDownload(attachment: Attachment) {
    try {
      const blob = await downloadAttachment(attachment.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = attachment.originalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Unable to download attachment.");
    }
  }

  async function handleDelete(attachment: Attachment) {
    if (locked) return;

    const confirmed = window.confirm(
      `Delete "${attachment.originalFileName}"?`
    );

    if (!confirmed) return;

    try {
      await deleteAttachment(attachment.id);
      setAttachments((current) =>
        current.filter((item) => item.id !== attachment.id)
      );
    } catch (err) {
      console.error(err);
      setError("Unable to delete attachment.");
    }
  }

  return (
    <section className="task-attachments">
      <div className="task-attachments-header">
        <div>
          <h3>Attachments</h3>
          <p>
            {attachments.length === 1
              ? "1 file attached"
              : `${attachments.length} files attached`}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={locked || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : "Add files"}
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            void handleFiles(event.target.files);
          }}
        />
      </div>

      {error && (
        <div className="task-attachments-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="task-attachments-empty">
          Loading attachments...
        </div>
      ) : attachments.length === 0 ? (
        <div className="task-attachments-empty">
          No attachments yet. Add photos, PDFs, documents, spreadsheets, audio, video, or ZIP files.
        </div>
      ) : (
        <div className="task-attachments-list">
          {attachments.map((attachment) => (
            <div
              className="task-attachment-item"
              key={attachment.id}
            >
              <div className="task-attachment-info">
                <strong>{attachment.originalFileName}</strong>
                <span>
                  {formatFileSize(attachment.fileSize)}
                  {attachment.contentType
                    ? ` · ${attachment.contentType}`
                    : ""}
                </span>
              </div>

              <div className="task-attachment-actions">
                {canPreview(attachment.contentType) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => void handlePreview(attachment)}
                  >
                    Preview
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void handleDownload(attachment)}
                >
                  Download
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={locked}
                  onClick={() => void handleDelete(attachment)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
