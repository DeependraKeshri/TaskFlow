import { useEffect, useState } from "react";
import {
  getTrashTasks,
  permanentlyDeleteTask,
  restoreTaskFromTrash,
} from "../api/taskApi";
import type { Task } from "../types/task";
import Navbar from "../components/Navbar";

export default function Trash() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrashTasks() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getTrashTasks(0, 100);

      setTasks(response.content);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load Trash."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrashTasks();
  }, []);

  async function handleRestore(task: Task) {
    try {
      await restoreTaskFromTrash(task.id);

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

  async function handlePermanentDelete(
    task: Task
  ) {
    const confirmed =
      window.confirm(
        `Permanently delete "${task.title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      await permanentlyDeleteTask(
        task.id
      );

      setTasks((current) =>
        current.filter(
          (item) => item.id !== task.id
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to permanently delete the task."
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
              🗑️ Trash
            </h1>

            <p>
              Deleted tasks stay here until they
              are restored or permanently deleted.
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
              Loading Trash...
            </h2>
          </div>
        ) : tasks.length === 0 ? (
          <div className="management-empty">
            <div className="management-empty-icon">
              🗑️
            </div>

            <h2>
              Trash is empty
            </h2>

            <p>
              Deleted tasks will appear here.
            </p>
          </div>
        ) : (
          <div className="management-grid">
            {tasks.map((task) => (
              <article
                className="management-task-card management-trash-card"
                key={task.id}
              >
                <div className="management-task-top">
                  <span
                    className={`task-priority task-priority-${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>

                  <span className="management-trash-badge">
                    🗑️ In Trash
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
                      handlePermanentDelete(
                        task
                      )
                    }
                  >
                    🗑️ Delete Forever
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