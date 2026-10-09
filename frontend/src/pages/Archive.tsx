import { useEffect, useState } from "react";
import {
  getArchivedTasks,
  moveTaskToTrash,
  restoreArchivedTask,
} from "../api/taskApi";
import type { Task } from "../types/task";
import Navbar from "../components/Navbar";

export default function Archive() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadArchivedTasks() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getArchivedTasks(0, 100);

      setTasks(response.content);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load archived tasks."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArchivedTasks();
  }, []);

  async function handleRestore(task: Task) {
    try {
      await restoreArchivedTask(task.id);

      setTasks((current) =>
        current.filter(
          (item) => item.id !== task.id
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to restore the task."
      );
    }
  }

  async function handleMoveToTrash(task: Task) {
    const confirmed =
      window.confirm(
        `Move "${task.title}" to Trash?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await moveTaskToTrash(task.id);

      setTasks((current) =>
        current.filter(
          (item) => item.id !== task.id
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to move the task to Trash."
      );
    }
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="management-page">
        <div className="management-header">
          <div>
            <span className="management-eyebrow">
              Task Management
            </span>

            <h1>
              📦 Archive
            </h1>

            <p>
              Tasks you've archived are stored here.
            </p>
          </div>

          <div className="management-count">
            {tasks.length}{" "}
            {tasks.length === 1
              ? "task"
              : "tasks"}
          </div>
        </div>

        {error && (
          <div className="management-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="management-empty">
            <div className="management-empty-icon">
              ⏳
            </div>

            <h2>
              Loading archive...
            </h2>
          </div>
        ) : tasks.length === 0 ? (
          <div className="management-empty">
            <div className="management-empty-icon">
              📦
            </div>

            <h2>
              Archive is empty
            </h2>

            <p>
              Archived tasks will appear here.
            </p>
          </div>
        ) : (
          <div className="management-grid">
            {tasks.map((task) => (
              <article
                className="management-task-card"
                key={task.id}
              >
                <div className="management-task-top">
                  <span
                    className={`task-priority task-priority-${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>

                  <span className="management-archived-badge">
                    📦 Archived
                  </span>
                </div>

                <h2>
                  {task.title}
                </h2>

                {task.description && (
                  <p>
                    {task.description}
                  </p>
                )}

                <div className="management-task-info">
                  <span>
                    Status:{" "}
                    {task.status.replace(
                      "_",
                      " "
                    )}
                  </span>

                  {task.dueDate && (
                    <span>
                      📅 {task.dueDate}
                    </span>
                  )}
                </div>

                <div className="management-task-actions">
                  <button
                    type="button"
                    className="management-primary-button"
                    onClick={() =>
                      handleRestore(task)
                    }
                  >
                    ↩ Restore
                  </button>

                  <button
                    type="button"
                    className="management-danger-button"
                    onClick={() =>
                      handleMoveToTrash(task)
                    }
                  >
                    🗑️ Trash
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}