import TaskBlockEditor from "../components/TaskBlockEditor";
import TaskAttachments from "../components/TaskAttachments";
import TaskDoodle from "../components/TaskDoodle";
import VoiceToText from "../components/VoiceToText";
import CameraScanner from "../components/CameraScanner";
import TaskSharing from "../components/TaskSharing";
import TaskComments from "../components/TaskComments";

import { uploadTaskAttachment } from "../api/attachmentApi";
import { getStoredUser } from "../api/authApi";
import {
  getMyTaskShare,
  type TaskShare,
} from "../api/taskShareApi";

import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import TaskForm from "../components/TaskForm";

import {
  archiveTask,
  getTask,
  moveTaskToTrash,
  toggleTaskLock,
  toggleTaskPin,
  updateTask,
} from "../api/taskApi";

import {
  deleteTaskDoodle,
  getTaskDoodle,
  saveTaskDoodle,
} from "../api/taskDoodleApi";

import type { User } from "../types/auth";
import type {
  Task,
  UpdateTaskRequest,
} from "../types/task";

export default function TaskDetailsPage() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<User | null>(null);

  const { taskId } =
    useParams<{ taskId: string }>();

  const [task, setTask] =
    useState<Task | null>(null);

  const [myShare, setMyShare] =
    useState<TaskShare | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showEditForm, setShowEditForm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [doodleImageData, setDoodleImageData] =
    useState<string | null>(null);

  const [doodleLoading, setDoodleLoading] =
    useState(false);

  const [voiceText, setVoiceText] =
    useState("");

  const [voiceSaving, setVoiceSaving] =
    useState(false);

  const [ocrText, setOcrText] =
    useState("");

  const [ocrSaving, setOcrSaving] =
    useState(false);

  const [
    attachmentRefreshKey,
    setAttachmentRefreshKey,
  ] = useState(0);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!taskId) {
      setError("Task ID is missing.");
      setLoading(false);
      return;
    }

    loadTask(taskId);
    loadDoodle(taskId);
  }, [taskId]);

  async function loadTask(id: string) {
    try {
      setLoading(true);
      setError("");

      const response =
        await getTask(id);

      setTask(response);

      try {
        const share =
          await getMyTaskShare(id);

        setMyShare(share);
      } catch {
        setMyShare(null);
      }
    } catch (err) {
      console.error(
        "Unable to load task:",
        err
      );

      setError(
        "Unable to load this task. It may have been deleted or you may not have access to it."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDoodle(id: string) {
    try {
      setDoodleLoading(true);

      const doodle =
        await getTaskDoodle(id);

      if (doodle) {
        setDoodleImageData(
          doodle.imageData
        );
      } else {
        setDoodleImageData(null);
      }
    } catch (err) {
      console.error(
        "Unable to load task doodle:",
        err
      );

      setDoodleImageData(null);
    } finally {
      setDoodleLoading(false);
    }
  }

  async function handleDoodleSave(
    imageData: string
  ) {
    if (!task) {
      return;
    }

    try {
      setDoodleLoading(true);
      setError("");

      const savedDoodle =
        await saveTaskDoodle(
          task.id,
          imageData
        );

      setDoodleImageData(
        savedDoodle.imageData
      );
    } catch (err) {
      console.error(
        "Unable to save task doodle:",
        err
      );

      setError(
        "Unable to save the doodle."
      );
    } finally {
      setDoodleLoading(false);
    }
  }

  async function handleDoodleDelete() {
    if (!task) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this doodle?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDoodleLoading(true);
      setError("");

      await deleteTaskDoodle(
        task.id
      );

      setDoodleImageData(null);
    } catch (err) {
      console.error(
        "Unable to delete task doodle:",
        err
      );

      setError(
        "Unable to delete the doodle."
      );
    } finally {
      setDoodleLoading(false);
    }
  }

  async function handleSaveVoiceText() {
    if (
      !task ||
      task.locked ||
      !voiceText.trim()
    ) {
      return;
    }

    try {
      setVoiceSaving(true);
      setError("");

      const existingDescription =
        task.description?.trim() || "";

      const newDescription =
        existingDescription
          ? `${existingDescription}\n\n${voiceText.trim()}`
          : voiceText.trim();

      const updatedTask =
        await updateTask(
          task.id,
          {
            description:
              newDescription,
          }
        );

      setTask(updatedTask);
      setVoiceText("");
    } catch (err) {
      console.error(
        "Unable to save voice text:",
        err
      );

      setError(
        "Unable to add voice text to the task description."
      );
    } finally {
      setVoiceSaving(false);
    }
  }

  async function handleCameraImageCaptured(
  imageData: string
) {
  if (
    !task ||
    task.locked
  ) {
    return;
  }

  try {
    setError("");

    /*
     * Convert the camera data URL directly into
     * a real JPEG Blob. This avoids relying on
     * fetch(data:) and guarantees the MIME type.
     */
    const commaIndex =
      imageData.indexOf(",");

    if (commaIndex === -1) {
      throw new Error(
        "Invalid captured image data."
      );
    }

    const metadata =
      imageData.slice(
        0,
        commaIndex
      );

    const base64Data =
      imageData.slice(
        commaIndex + 1
      );

    if (
      !metadata.includes(
        "data:image/"
      ) ||
      !base64Data
    ) {
      throw new Error(
        "The captured image is not a valid image."
      );
    }

    const binaryString =
      window.atob(base64Data);

    const bytes =
      new Uint8Array(
        binaryString.length
      );

    for (
      let index = 0;
      index < binaryString.length;
      index += 1
    ) {
      bytes[index] =
        binaryString.charCodeAt(
          index
        );
    }

    const blob =
      new Blob(
        [bytes],
        {
          type: "image/jpeg",
        }
      );

    const fileName =
      `camera-capture-${Date.now()}.jpg`;

    const file =
      new File(
        [blob],
        fileName,
        {
          type: "image/jpeg",
          lastModified:
            Date.now(),
        }
      );

    const uploaded =
      await uploadTaskAttachment(
        task.id,
        file
      );

    console.log(
      "Camera image uploaded successfully:",
      uploaded
    );

    setAttachmentRefreshKey(
      (current) =>
        current + 1
    );
  } catch (err) {
    console.error(
      "Unable to save camera image:",
      err
    );

    /*
     * Preserve the actual Axios/server message
     * when one is available.
     */
    const axiosError =
      err as {
        response?: {
          status?: number;
          data?: unknown;
        };
        message?: string;
      };

    const status =
      axiosError.response?.status;

    if (status === 403) {
      setError(
        "Camera image upload was rejected (403 Forbidden). The camera is working, but the current user does not have permission to add attachments to this task."
      );
    } else if (status === 401) {
      setError(
        "Your session has expired. Please sign in again and retry the camera upload."
      );
    } else {
      setError(
        axiosError.message ||
          "Unable to save the captured image as an attachment."
      );
    }

    throw err;
  }
}

  async function handleSaveOCRText() {
    if (
      !task ||
      task.locked ||
      !ocrText.trim() ||
      ocrSaving
    ) {
      return;
    }

    const extractedText =
      ocrText.trim();

    try {
      setOcrSaving(true);
      setError("");

      const existingDescription =
        task.description?.trim() || "";

      const newDescription =
        existingDescription
          ? `${existingDescription}\n\n${extractedText}`
          : extractedText;

      const updatedTask =
        await updateTask(
          task.id,
          {
            description:
              newDescription,
          }
        );

      setTask(updatedTask);
      setOcrText("");
    } catch (err) {
      console.error(
        "Unable to save OCR text:",
        err
      );

      setError(
        "Unable to add extracted text to the task description."
      );
    } finally {
      setOcrSaving(false);
    }
  }

  async function handleStatusChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    if (!task) {
      return;
    }

    const nextStatus =
      event.target.value as Task["status"];

    if (nextStatus === task.status) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const updatedTask =
        await updateTask(
          task.id,
          {
            status: nextStatus,
          }
        );

      setTask(updatedTask);
    } catch (err) {
      console.error(
        "Unable to update task status:",
        err
      );

      setError(
        "Unable to update the task status."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEditSubmit(
    data: UpdateTaskRequest
  ) {
    if (!task) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const updatedTask =
        await updateTask(
          task.id,
          data
        );

      setTask(updatedTask);
      setShowEditForm(false);
    } catch (err) {
      console.error(
        "Unable to update task:",
        err
      );

      setError(
        "Unable to update the task."
      );

      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTogglePin() {
    if (!task) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const updatedTask =
        await toggleTaskPin(
          task.id
        );

      setTask(updatedTask);
    } catch (err) {
      console.error(
        "Unable to update task pin:",
        err
      );

      setError(
        "Unable to update the task."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleLock() {
    if (!task) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const updatedTask =
        await toggleTaskLock(
          task.id
        );

      setTask(updatedTask);
    } catch (err) {
      console.error(
        "Unable to update task lock:",
        err
      );

      setError(
        "Unable to update the task."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleArchive() {
    if (!task) {
      return;
    }

    const confirmed =
      window.confirm(
        "Archive this task?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await archiveTask(task.id);

      navigate("/archive");
    } catch (err) {
      console.error(
        "Unable to archive task:",
        err
      );

      setError(
        "Unable to archive the task."
      );

      setActionLoading(false);
    }
  }

  async function handleMoveToTrash() {
    if (!task) {
      return;
    }

    const confirmed =
      window.confirm(
        "Move this task to trash?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await moveTaskToTrash(
        task.id
      );

      navigate("/trash");
    } catch (err) {
      console.error(
        "Unable to move task to trash:",
        err
      );

      setError(
        "Unable to move the task to trash."
      );

      setActionLoading(false);
    }
  }

  function formatDate(
    value: string | null
  ): string {
    if (!value) {
      return "Not set";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(
    value: string
  ): string {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function getStatusLabel(
    status: Task["status"]
  ): string {
    switch (status) {
      case "TODO":
        return "To Do";

      case "IN_PROGRESS":
        return "In Progress";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status;
    }
  }

  function getPriorityLabel(
    priority: Task["priority"]
  ): string {
    switch (priority) {
      case "LOW":
        return "Low";

      case "MEDIUM":
        return "Medium";

      case "HIGH":
        return "High";

      case "URGENT":
        return "Urgent";

      default:
        return priority;
    }
  }

  function getStatusClass(
    status: Task["status"]
  ): string {
    switch (status) {
      case "TODO":
        return "task-details-status-todo";

      case "IN_PROGRESS":
        return "task-details-status-progress";

      case "COMPLETED":
        return "task-details-status-completed";

      case "CANCELLED":
        return "task-details-status-cancelled";

      default:
        return "";
    }
  }

  function getPriorityClass(
    priority: Task["priority"]
  ): string {
    switch (priority) {
      case "LOW":
        return "task-details-priority-low";

      case "MEDIUM":
        return "task-details-priority-medium";

      case "HIGH":
        return "task-details-priority-high";

      case "URGENT":
        return "task-details-priority-urgent";

      default:
        return "";
    }
  }

  if (loading) {
    return (
      <main className="task-details-page">
        <div className="task-details-loading">
          <div className="loading-spinner" />

          <p>
            Loading task...
          </p>
        </div>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="task-details-page">
        <div className="task-details-error">

          <div className="task-details-error-icon">
            ⚠
          </div>

          <h2>
            Unable to load task
          </h2>

          <p>
            {error ||
              "The requested task could not be found."}
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

        </div>
      </main>
    );
  }

  const canComment =
    user?.id === task.createdBy ||
    user?.id === task.assignedTo ||
    myShare?.permission === "COMMENT" ||
    myShare?.permission === "EDIT" ||
    myShare?.permission === "FULL_ACCESS";

  return (
    <main className="task-details-page">

      {showEditForm && (
        <TaskForm
          task={task}
          onSubmit={async (data) => {
            await handleEditSubmit(
              data as UpdateTaskRequest
            );
          }}
          onCancel={() =>
            setShowEditForm(false)
          }
          loading={actionLoading}
        />
      )}

      <div className="task-details-container">

        <div className="task-details-breadcrumb">

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <span>/</span>

          <span>
            {task.projectName}
          </span>

          <span>/</span>

          <strong>
            {task.title}
          </strong>

        </div>

        {error && (
          <div
            className="task-details-error-banner"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="task-details-header">

          <div className="task-details-header-main">

            <div className="task-details-badge-row">

              <span
                className={`task-details-status ${getStatusClass(
                  task.status
                )}`}
              >
                {getStatusLabel(
                  task.status
                )}
              </span>

              <span
                className={`task-details-priority ${getPriorityClass(
                  task.priority
                )}`}
              >
                {getPriorityLabel(
                  task.priority
                )}
              </span>

              {task.pinned && (
                <span className="task-details-small-badge">
                  📌 Pinned
                </span>
              )}

              {task.locked && (
                <span className="task-details-small-badge">
                  🔒 Locked
                </span>
              )}

              {task.archived && (
                <span className="task-details-small-badge">
                  📦 Archived
                </span>
              )}

            </div>

            <h1>
              {task.title}
            </h1>

            <p className="task-details-project">
              Project:{" "}
              <strong>
                {task.projectName}
              </strong>
            </p>

          </div>

          <div className="task-details-header-actions">

            <button
              type="button"
              className="btn btn-secondary"
              disabled={
                actionLoading ||
                task.locked
              }
              onClick={() =>
                setShowEditForm(true)
              }
              title={
                task.locked
                  ? "Unlock the task before editing"
                  : "Edit task"
              }
            >
              ✎ Edit
            </button>

          </div>

        </section>

        <div className="task-details-grid">

          <section className="task-details-main-card">

            <div className="task-details-section">

              <h2>
                Description
              </h2>

              {task.description ? (
                <p className="task-details-description">
                  {task.description}
                </p>
              ) : (
                <p className="task-details-empty">
                  No description added.
                </p>
              )}

            </div>

            <div className="task-details-divider" />

            <div className="task-details-section">

              <h2>
                Attachments
              </h2>

              <TaskAttachments
                key={attachmentRefreshKey}
                taskId={task.id}
                locked={task.locked}
              />

            </div>

            <div className="task-details-divider" />

            <div className="task-details-section">

              <TaskBlockEditor
                taskId={task.id}
                locked={task.locked}
              />

            </div>

            <div className="task-details-divider" />

            <div className="task-details-section">

              <h2>
                🎙 Voice-to-Text
              </h2>

              <p
                className="task-details-empty"
                style={{
                  marginBottom: "12px",
                }}
              >
                Speak naturally and convert
                your voice into text. You can
                review the text before adding it
                to the task description.
              </p>

              <VoiceToText
                value={voiceText}
                onChange={setVoiceText}
                disabled={task.locked}
                placeholder="Click Start Voice Input and speak..."
              />

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    task.locked ||
                    voiceSaving ||
                    !voiceText.trim()
                  }
                  onClick={
                    handleSaveVoiceText
                  }
                >
                  {voiceSaving
                    ? "Adding..."
                    : "Add to Description"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={
                    voiceSaving ||
                    !voiceText.trim()
                  }
                  onClick={() =>
                    setVoiceText("")
                  }
                >
                  Clear Voice Text
                </button>

              </div>

            </div>

            <div className="task-details-divider" />

            <div className="task-details-section">

              <h2>
                📷 Camera & OCR
              </h2>

              <p
                className="task-details-empty"
                style={{
                  marginBottom: "12px",
                }}
              >
                Capture a document, note,
                receipt, whiteboard, or other
                image. Save the image directly
                as a task attachment or extract
                its text with OCR.
              </p>

              <CameraScanner
                disabled={task.locked}
                onTextExtracted={setOcrText}
                onImageCaptured={
                  handleCameraImageCaptured
                }
              />

              {ocrText.trim() && (
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={
                      task.locked ||
                      ocrSaving ||
                      !ocrText.trim()
                    }
                    onClick={
                      handleSaveOCRText
                    }
                  >
                    {ocrSaving
                      ? "Adding..."
                      : "Add OCR Text to Description"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={ocrSaving}
                    onClick={() =>
                      setOcrText("")
                    }
                  >
                    Clear OCR Text
                  </button>

                </div>
              )}

            </div>

            <div className="task-details-divider" />

            <div className="task-details-section">

              <h2>
                Doodle
              </h2>

              {doodleLoading && (
                <p className="task-details-empty">
                  Loading doodle...
                </p>
              )}

              <TaskDoodle
                locked={task.locked}
                initialImageData={
                  doodleImageData
                }
                onSave={
                  handleDoodleSave
                }
                onDelete={
                  handleDoodleDelete
                }
              />

            </div>

            <div className="task-details-divider" />

            <div className="task-details-section">

              <h2>
                Sharing
              </h2>

              <TaskSharing
                taskId={task.id}
                canManageSharing={
                  user?.id === task.createdBy
                }
              />

            </div>

            <div className="task-details-divider" />

            <TaskComments
              taskId={task.id}
              currentUserId={user?.id}
              canComment={canComment}
            />

            <div className="task-details-divider" />

            <div className="task-details-section">

              <h2>
                Task Information
              </h2>

              <div className="task-details-info-grid">

                <div className="task-details-info-item">

                  <span>
                    Status
                  </span>

                  <select
                    className="task-details-status-select"
                    value={task.status}
                    onChange={
                      handleStatusChange
                    }
                    disabled={
                      actionLoading ||
                      task.locked
                    }
                    title={
                      task.locked
                        ? "Unlock this task first"
                        : "Change task status"
                    }
                  >

                    <option value="TODO">
                      To Do
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>

                  </select>

                </div>

                <div className="task-details-info-item">

                  <span>
                    Priority
                  </span>

                  <strong>
                    {getPriorityLabel(
                      task.priority
                    )}
                  </strong>

                </div>

                <div className="task-details-info-item">

                  <span>
                    Due Date
                  </span>

                  <strong>
                    {formatDate(
                      task.dueDate
                    )}
                  </strong>

                </div>

                <div className="task-details-info-item">

                  <span>
                    Position
                  </span>

                  <strong>
                    #{task.position}
                  </strong>

                </div>

              </div>

            </div>

            <div className="task-details-divider" />

            <div className="task-details-section">

              <h2>
                People
              </h2>

              <div className="task-details-people">

                <div className="task-details-person">

                  <div className="task-details-avatar">
                    {task.createdByName
                      ?.charAt(0)
                      .toUpperCase() ||
                      "U"}
                  </div>

                  <div>

                    <span>
                      Created by
                    </span>

                    <strong>
                      {task.createdByName}
                    </strong>

                  </div>

                </div>

                <div className="task-details-person">

                  <div className="task-details-avatar">
                    {task.assignedToName
                      ?.charAt(0)
                      .toUpperCase() ||
                      "—"}
                  </div>

                  <div>

                    <span>
                      Assigned to
                    </span>

                    <strong>
                      {task.assignedToName ||
                        "Unassigned"}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </section>

          <aside className="task-details-sidebar">

            <section className="task-details-side-card">

              <h3>
                Task Actions
              </h3>

              <button
                type="button"
                className="task-details-action"
                onClick={
                  handleTogglePin
                }
                disabled={
                  actionLoading
                }
              >
                <span>
                  📌
                </span>

                {task.pinned
                  ? "Unpin Task"
                  : "Pin Task"}

              </button>

              <button
                type="button"
                className="task-details-action"
                onClick={
                  handleToggleLock
                }
                disabled={
                  actionLoading
                }
              >
                <span>
                  {task.locked
                    ? "🔓"
                    : "🔒"}
                </span>

                {task.locked
                  ? "Unlock Task"
                  : "Lock Task"}

              </button>

              <button
                type="button"
                className="task-details-action"
                onClick={
                  handleArchive
                }
                disabled={
                  actionLoading
                }
              >
                <span>
                  📦
                </span>

                Archive Task

              </button>

              <button
                type="button"
                className="task-details-action task-details-action-danger"
                onClick={
                  handleMoveToTrash
                }
                disabled={
                  actionLoading
                }
              >
                <span>
                  🗑
                </span>

                Move to Trash

              </button>

            </section>

            <section className="task-details-side-card">

              <h3>
                Activity
              </h3>

              <div className="task-details-activity-item">

                <span>
                  Created
                </span>

                <strong>
                  {formatDateTime(
                    task.createdAt
                  )}
                </strong>

              </div>

              <div className="task-details-activity-item">

                <span>
                  Last updated
                </span>

                <strong>
                  {formatDateTime(
                    task.updatedAt
                  )}
                </strong>

              </div>

            </section>

            <button
              type="button"
              className="task-details-back-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              ← Back to Tasks
            </button>

          </aside>

        </div>

      </div>

    </main>
  );
}
