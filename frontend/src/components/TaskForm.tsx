import VoiceInput from "./VoiceInput";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type {
  CreateTaskRequest,
  Task,
  TaskPriority,
  UpdateTaskRequest,
} from "../types/task";

interface TaskFormProps {
  task?: Task | null;

  onSubmit: (
    data: CreateTaskRequest | UpdateTaskRequest
  ) => Promise<void>;

  onCancel: () => void;

  loading?: boolean;
}

const priorityOptions: {
  value: TaskPriority;
  label: string;
}[] = [
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
  {
    value: "URGENT",
    label: "Urgent",
  },
];

function formatDateForInput(
  value: string | null | undefined
): string {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function TaskForm({
  task,
  onSubmit,
  onCancel,
  loading = false,
}: TaskFormProps) {
  const isEditMode = Boolean(task);

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<TaskPriority>("MEDIUM");

  const [dueDate, setDueDate] =
    useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);

      setDescription(
        task.description ?? ""
      );

      setPriority(task.priority);

      setDueDate(
        formatDateForInput(task.dueDate)
      );
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
    }

    setError("");
  }, [task]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedTitle =
      title.trim();

    if (!trimmedTitle) {
      setError(
        "Task title is required."
      );
      return;
    }

    if (trimmedTitle.length > 200) {
      setError(
        "Task title cannot exceed 200 characters."
      );
      return;
    }

    if (description.length > 5000) {
      setError(
        "Description cannot exceed 5000 characters."
      );
      return;
    }

    try {
      if (isEditMode) {
        const data: UpdateTaskRequest = {
          title: trimmedTitle,
          description:
            description.trim() ||
            undefined,
          priority,
          dueDate:
            dueDate || undefined,
        };

        await onSubmit(data);
      } else {
        const data: CreateTaskRequest = {
          title: trimmedTitle,
          description:
            description.trim() ||
            undefined,
          priority,
          dueDate:
            dueDate || undefined,
        };

        await onSubmit(data);
      }
    } catch (err) {
      console.error(
        "Task form submission failed:",
        err
      );

      setError(
        "Unable to save the task. Please try again."
      );
    }
  }

  function handleVoiceTranscript(
    transcript: string
  ) {
    setDescription((current) => {
      const separator =
        current.trim() ? " " : "";

      return `${current}${separator}${transcript}`.slice(
        0,
        5000
      );
    });
  }

  return (
    <div
      className="task-form-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onCancel();
        }
      }}
    >
      <section
        className="task-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <div className="task-form-header">
          <div>
            <h2 id="task-form-title">
              {isEditMode
                ? "Edit Task"
                : "Create Task"}
            </h2>

            <p>
              {isEditMode
                ? "Update the task details."
                : "Create a new task for your project."}
            </p>
          </div>

          <button
            type="button"
            className="task-form-close"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form
          className="task-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div
              className="task-form-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="task-form-field">
            <label htmlFor="task-title">
              Title
              <span>*</span>
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Enter task title"
              maxLength={200}
              disabled={loading}
              autoFocus
            />

            <small>
              {title.length}/200
            </small>
          </div>

          <div className="task-form-field">
            <label htmlFor="task-description">
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the task..."
              rows={5}
              maxLength={5000}
              disabled={loading}
            />

            <small>
              {description.length}/5000
            </small>

            <VoiceInput
              disabled={loading}
              onTranscript={
                handleVoiceTranscript
              }
            />
          </div>

          <div className="task-form-row">
            <div className="task-form-field">
              <label htmlFor="task-priority">
                Priority
              </label>

              <select
                id="task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as TaskPriority
                  )
                }
                disabled={loading}
              >
                {priorityOptions.map(
                  (option) => (
                    <option
                      key={option.value}
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

            <div className="task-form-field">
              <label htmlFor="task-due-date">
                Due date
              </label>

              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value
                  )
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="task-form-footer">
            <button
              type="button"
              className="task-form-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="task-form-submit"
              disabled={
                loading ||
                !title.trim()
              }
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
