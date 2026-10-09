import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStoredUser,
} from "../api/authApi";

import {
  getTodayTasks,
  getUpcomingTasks,
} from "../api/taskApi";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "../types/task";

import AppShell from "../components/AppShell";


interface TaskListPageProps {
  mode: "today" | "upcoming";
}


/*
 * =========================================================
 * PRIORITY META
 * =========================================================
 */

const priorityMeta: Record<
  TaskPriority,
  {
    label: string;
    className: string;
  }
> = {

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


/*
 * =========================================================
 * STATUS META
 * =========================================================
 */

const statusMeta: Record<
  TaskStatus,
  {
    label: string;
    className: string;
  }
> = {

  TODO: {
    label: "To Do",
    className: "global-task-status-todo",
  },

  IN_PROGRESS: {
    label: "In Progress",
    className: "global-task-status-progress",
  },

  COMPLETED: {
    label: "Completed",
    className: "global-task-status-completed",
  },

  CANCELLED: {
    label: "Cancelled",
    className: "global-task-status-cancelled",
  },

};


/*
 * =========================================================
 * DATE FORMATTER
 * =========================================================
 */

function formatDate(
  value: string | null
): string {

  if (!value) {
    return "No due date";
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


/*
 * =========================================================
 * DUE LABEL
 * =========================================================
 */

function getDueLabel(
  task: Task,
  mode: "today" | "upcoming"
): string {

  if (!task.dueDate) {
    return "No due date";
  }

  if (mode === "today") {
    return "Today";
  }

  return formatDate(
    task.dueDate
  );

}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function TaskListPage({
  mode,
}: TaskListPageProps) {

  const navigate =
    useNavigate();


  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const isToday =
    mode === "today";


  /*
   * =======================================================
   * PAGE TEXT
   * =======================================================
   */

  const pageTitle =
    isToday
      ? "Today's Tasks"
      : "Upcoming Tasks";

  const pageDescription =
    isToday
      ? "Tasks that are due today."
      : "Tasks scheduled for upcoming dates.";

  const emptyTitle =
    isToday
      ? "No tasks for today"
      : "No upcoming tasks";

  const emptyDescription =
    isToday
      ? "You don't have any tasks due today."
      : "You don't have any tasks scheduled after today.";


  /*
   * =======================================================
   * LOAD TASKS
   * =======================================================
   */

  useEffect(() => {

    const user =
      getStoredUser();

    if (!user) {

      navigate("/login");

      return;
    }

    loadTasks();

  }, [
    navigate,
    mode,
  ]);


  async function loadTasks() {

    try {

      setLoading(true);

      setError("");


      const response =
        isToday

          ? await getTodayTasks(
              0,
              100
            )

          : await getUpcomingTasks(
              0,
              100
            );


      setTasks(
        response.content
      );

    } catch (err) {

      console.error(err);

      setError(
        `Unable to load ${
          isToday
            ? "today's"
            : "upcoming"
        } tasks.`
      );

    } finally {

      setLoading(false);

    }

  }


  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (

    <AppShell>

      <main className="dashboard-page">

        <div className="management-page">


          {/* =================================================
              HEADER
          ================================================= */}

          <header className="management-header">

            <div>

              <span className="management-eyebrow">
                TASK MANAGEMENT
              </span>

              <h1>
                {pageTitle}
              </h1>

              <p>
                {pageDescription}
              </p>

            </div>


            <div className="management-count">

              {tasks.length}{" "}

              {
                tasks.length === 1
                  ? "task"
                  : "tasks"
              }

            </div>

          </header>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="management-error">

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={loadTasks}
              >
                Retry
              </button>

            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="management-empty">

              <div className="management-empty-icon">
                ⏳
              </div>

              <h2>
                Loading tasks...
              </h2>

              <p>
                Please wait while TaskFlow
                loads your tasks.
              </p>

            </div>


          ) : tasks.length === 0 ? (

            <div className="management-empty">

              <div className="management-empty-icon">

                {
                  isToday
                    ? "☀"
                    : "📅"
                }

              </div>

              <h2>
                {emptyTitle}
              </h2>

              <p>
                {emptyDescription}
              </p>

              <button
                type="button"
                className="management-primary-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                Go to Dashboard
              </button>

            </div>


          ) : (

            <div className="global-task-grid">

              {tasks.map((task) => {

                const priority =
                  priorityMeta[
                    task.priority
                  ];

                const status =
                  statusMeta[
                    task.status
                  ];


                return (

                  <article
                    key={task.id}
                    className="global-task-card"
                  >


                    {/* =======================================
                        TOP
                    ======================================= */}

                    <div className="global-task-card-top">

                      <div className="global-task-title-area">

                        {task.pinned && (

                          <span
                            className="global-task-pin"
                            title="Pinned"
                          >
                            📌
                          </span>

                        )}

                        {task.locked && (

                          <span
                            className="global-task-lock"
                            title="Locked"
                          >
                            🔒
                          </span>

                        )}

                        <h3>
                          {task.title}
                        </h3>

                      </div>


                      <span
                        className={`task-priority ${priority.className}`}
                      >
                        {priority.label}
                      </span>

                    </div>


                    {/* =======================================
                        DESCRIPTION
                    ======================================= */}

                    {task.description && (

                      <p className="global-task-description">
                        {task.description}
                      </p>

                    )}


                    {/* =======================================
                        STATUS / DUE DATE
                    ======================================= */}

                    <div className="global-task-meta">

                      <span
                        className={`global-task-status ${status.className}`}
                      >
                        {status.label}
                      </span>


                      <span className="global-task-due">

                        📅{" "}

                        {
                          getDueLabel(
                            task,
                            mode
                          )
                        }

                      </span>

                    </div>


                    {/* =======================================
                        PROJECT
                    ======================================= */}

                    <div className="global-task-project">

                      <span className="global-task-project-label">
                        PROJECT
                      </span>

                      <strong>
                        {task.projectName}
                      </strong>

                    </div>


                    {/* =======================================
                        FOOTER
                    ======================================= */}

                    <div className="global-task-footer">

                      <span>

                        Created by{" "}

                        {task.createdByName}

                      </span>


                      <button
                        type="button"
                        className="management-primary-button"
                        onClick={() =>
                          navigate("/dashboard")
                        }
                      >
                        Open Dashboard
                      </button>

                    </div>


                  </article>

                );

              })}

            </div>

          )}

        </div>

      </main>

    </AppShell>

  );

}