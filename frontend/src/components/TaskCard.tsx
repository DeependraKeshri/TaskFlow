import { useNavigate } from "react-router-dom";

import type {
  DragEvent,
} from "react";

import type {
  Task,
  TaskStatus,
} from "../types/task";

interface TaskCardProps {
  task: Task;

  onDelete: (task: Task) => void;

  onTogglePin: (task: Task) => void;
  onToggleLock: (task: Task) => void;

  onArchive: (task: Task) => void;
  onDuplicate: (task: Task) => void;

  onStatusChange: (
    task: Task,
    status: TaskStatus
  ) => void;
}

const priorityMeta = {
  LOW: {
    label: "Low",
    className: "task-priority-low",
  },

  MEDIUM: {
    label: "Medium",
    className: "task-priority-medium",
  },

  HIGH: {
    label: "High",
    className: "task-priority-high",
  },

  URGENT: {
    label: "Urgent",
    className: "task-priority-urgent",
  },
};

const statusOptions: {
  value: TaskStatus;
  label: string;
}[] = [
  {
    value: "TODO",
    label: "To Do",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

export default function TaskCard({
  task,
  onDelete,
  onTogglePin,
  onToggleLock,
  onArchive,
  onDuplicate,
  onStatusChange,
}: TaskCardProps) {
  const navigate = useNavigate();

  const priority =
    priorityMeta[task.priority];

  function formatDueDate(
    value: string | null
  ): string {
    if (!value) {
      return "";
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

  function isOverdue(): boolean {
    if (!task.dueDate) {
      return false;
    }

    if (
      task.status === "COMPLETED" ||
      task.status === "CANCELLED"
    ) {
      return false;
    }

    const due =
      new Date(task.dueDate);

    const today =
      new Date();

    due.setHours(
      23,
      59,
      59,
      999
    );

    today.setHours(
      0,
      0,
      0,
      0
    );

    return due < today;
  }

  function handleOpenDetails() {
    navigate(
      `/tasks/${task.id}`
    );
  }

  function handleDragStart(
    event: DragEvent<HTMLElement>
  ) {
    if (task.locked) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/task-id",
      task.id
    );
  }

  const overdue =
    isOverdue();

  return (
    <article
      className={[
        "task-card",
        task.pinned
          ? "task-card-pinned"
          : "",
        task.locked
          ? "task-card-locked"
          : "",
      ].join(" ")}
      draggable={!task.locked}
      onDragStart={handleDragStart}
    >
      <div className="task-card-top">

        <div className="task-card-badges">

          <span
            className={`task-priority-badge ${priority.className}`}
          >
            {priority.label}
          </span>

          {task.pinned && (
            <span
              className="task-status-badge task-pinned-badge"
              title="Pinned"
            >
              📌
            </span>
          )}

          {task.locked && (
            <span
              className="task-status-badge task-locked-badge"
              title="Locked"
            >
              🔒
            </span>
          )}

        </div>

        <button
          type="button"
          className="task-menu-button"
          title="Duplicate task"
          onClick={() =>
            onDuplicate(task)
          }
        >
          ⋮
        </button>

      </div>

      <button
        type="button"
        className="task-card-content"
        onClick={
          handleOpenDetails
        }
        title="Open task details"
      >
        <h4>
          {task.title}
        </h4>

        {task.description && (
          <p>
            {task.description}
          </p>
        )}
      </button>

      <div className="task-card-meta">

        {task.dueDate && (
          <span
            className={
              overdue
                ? "task-due-date task-due-overdue"
                : "task-due-date"
            }
          >
            ◷{" "}
            {formatDueDate(
              task.dueDate
            )}
          </span>
        )}

        {task.assignedToName && (
          <span className="task-assignee">
            👤{" "}
            {task.assignedToName}
          </span>
        )}

      </div>

      <div className="task-card-status">

        <select
          value={task.status}
          disabled={task.locked}
          onChange={(event) => {
            const nextStatus =
              event.target
                .value as TaskStatus;

            if (
              nextStatus !==
              task.status
            ) {
              onStatusChange(
                task,
                nextStatus
              );
            }
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          title={
            task.locked
              ? "Unlock this task first"
              : "Change task status"
          }
        >
          {statusOptions.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {option.label}
              </option>
            )
          )}
        </select>

      </div>

      <div className="task-card-actions">

        <button
          type="button"
          className={`task-action-button ${
            task.pinned
              ? "task-action-active"
              : ""
          }`}
          title={
            task.pinned
              ? "Unpin task"
              : "Pin task"
          }
          onClick={() =>
            onTogglePin(task)
          }
        >
          📌
        </button>

        <button
          type="button"
          className={`task-action-button ${
            task.locked
              ? "task-action-active"
              : ""
          }`}
          title={
            task.locked
              ? "Unlock task"
              : "Lock task"
          }
          onClick={() =>
            onToggleLock(task)
          }
        >
          {task.locked
            ? "🔓"
            : "🔒"}
        </button>

        <button
          type="button"
          className="task-action-button"
          title="Archive task"
          onClick={() =>
            onArchive(task)
          }
        >
          📦
        </button>

        <button
          type="button"
          className="task-action-button task-action-danger"
          title="Move to trash"
          onClick={() =>
            onDelete(task)
          }
        >
          🗑
        </button>

      </div>
    </article>
  );
}