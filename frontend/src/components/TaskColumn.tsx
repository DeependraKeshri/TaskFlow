import {
  useState,
  type DragEvent,
} from "react";

import type {
  Task,
  TaskStatus,
} from "../types/task";

import TaskCard from "./TaskCard";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];

  onDelete: (task: Task) => void;

  onTogglePin: (task: Task) => void;
  onToggleLock: (task: Task) => void;

  onArchive: (task: Task) => void;
  onDuplicate: (task: Task) => void;

  onStatusChange: (
    task: Task,
    status: TaskStatus
  ) => void;

  onTaskDrop: (
    taskId: string,
    status: TaskStatus
  ) => void;
}

const statusMeta: Record<
  TaskStatus,
  {
    icon: string;
    className: string;
  }
> = {
  TODO: {
    icon: "○",
    className: "task-column-todo",
  },

  IN_PROGRESS: {
    icon: "◐",
    className: "task-column-progress",
  },

  COMPLETED: {
    icon: "✓",
    className: "task-column-completed",
  },

  CANCELLED: {
    icon: "×",
    className: "task-column-cancelled",
  },
};

export default function TaskColumn({
  title,
  status,
  tasks,
  onDelete,
  onTogglePin,
  onToggleLock,
  onArchive,
  onDuplicate,
  onStatusChange,
  onTaskDrop,
}: TaskColumnProps) {
  const [isDragOver, setIsDragOver] =
    useState(false);

  const meta = statusMeta[status];

  function handleDragEnter(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    if (
      event.dataTransfer.types.includes(
        "text/task-id"
      )
    ) {
      setIsDragOver(true);
    }
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    if (
      event.dataTransfer.types.includes(
        "text/task-id"
      )
    ) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    const currentTarget =
      event.currentTarget;

    const relatedTarget =
      event.relatedTarget as Node | null;

    if (
      relatedTarget &&
      currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    setIsDragOver(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setIsDragOver(false);

    const taskId =
      event.dataTransfer.getData(
        "text/task-id"
      );

    if (!taskId) {
      return;
    }

    onTaskDrop(taskId, status);
  }

  return (
    <section
      className={[
        "task-column",
        meta.className,
        isDragOver
          ? "task-column-drag-over"
          : "",
      ].join(" ")}
    >
      <div className="task-column-header">
        <div className="task-column-title">
          <span className="task-column-icon">
            {meta.icon}
          </span>

          <h3>{title}</h3>
        </div>

        <span className="task-column-count">
          {tasks.length}
        </span>
      </div>

      <div
        className="task-column-content"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.length === 0 ? (
          <div className="task-column-empty">
            <span className="task-column-empty-icon">
              {meta.icon}
            </span>

            <span>
              {isDragOver
                ? "Drop task here"
                : "No tasks"}
            </span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onTogglePin={
                onTogglePin
              }
              onToggleLock={
                onToggleLock
              }
              onArchive={onArchive}
              onDuplicate={
                onDuplicate
              }
              onStatusChange={
                onStatusChange
              }
            />
          ))
        )}
      </div>
    </section>
  );
}