import type { Task, TaskStatus } from "../types/task";

import TaskColumn from "./TaskColumn";

interface TaskBoardProps {
  tasks: Task[];

  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;

  onTogglePin: (task: Task) => void;
  onToggleLock: (task: Task) => void;

  onArchive: (task: Task) => void;
  onDuplicate: (task: Task) => void;

  onStatusChange: (
    task: Task,
    status: TaskStatus
  ) => void;

  onTaskDrop?: (
    taskId: string,
    status: TaskStatus
  ) => void;
}

const columns: {
  title: string;
  status: TaskStatus;
}[] = [
  {
    title: "To Do",
    status: "TODO",
  },
  {
    title: "In Progress",
    status: "IN_PROGRESS",
  },
  {
    title: "Completed",
    status: "COMPLETED",
  },
  {
    title: "Cancelled",
    status: "CANCELLED",
  },
];

export default function TaskBoard({
  tasks,
  onDelete,
  onTogglePin,
  onToggleLock,
  onArchive,
  onDuplicate,
  onStatusChange,
  onTaskDrop,
}: TaskBoardProps) {
  function handleTaskDrop(
    taskId: string,
    status: TaskStatus
  ) {
    if (onTaskDrop) {
      onTaskDrop(taskId, status);
    }
  }

  return (
    <div className="task-board">
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.status
        );

        return (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={columnTasks}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
            onToggleLock={onToggleLock}
            onArchive={onArchive}
            onDuplicate={onDuplicate}
            onStatusChange={onStatusChange}
            onTaskDrop={handleTaskDrop}
          />
        );
      })}
    </div>
  );
}