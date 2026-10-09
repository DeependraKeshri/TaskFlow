import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceMembers from "../components/WorkspaceMembers";
import TaskForm from "../components/TaskForm";
import {
  getStoredUser,
  logout,
} from "../api/authApi";

import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "../api/workspaceApi";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projectApi";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskPin,
  toggleTaskLock,
  archiveTask,
  duplicateTask,
} from "../api/taskApi";

import type { User } from "../types/auth";

import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from "../types/workspace";

import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../types/project";

import type {
  Task,
  TaskPriority,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/task";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskBoard from "../components/TaskBoard";

export default function Dashboard() {
  const navigate = useNavigate();

  // =========================================================
  // USER
  // =========================================================

  const [user, setUser] = useState<User | null>(null);

  // =========================================================
  // WORKSPACE
  // =========================================================

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState("");

  const [showWorkspaceForm, setShowWorkspaceForm] =
    useState(false);

  const [editingWorkspaceId, setEditingWorkspaceId] =
    useState<string | null>(null);

  const [workspaceName, setWorkspaceName] =
    useState("");

  const [workspaceDescription, setWorkspaceDescription] =
    useState("");

  // =========================================================
  // PROJECT
  // =========================================================

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [selectedProjectId, setSelectedProjectId] =
    useState("");

  const [showProjectForm, setShowProjectForm] =
    useState(false);

  const [editingProjectId, setEditingProjectId] =
    useState<string | null>(null);

  const [projectName, setProjectName] =
    useState("");

  const [projectDescription, setProjectDescription] =
    useState("");

  // =========================================================
  // TASKS
  // =========================================================

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [showTaskForm, setShowTaskForm] =
    useState(false);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);

  // =========================================================
  // GENERAL
  // =========================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [taskSearch, setTaskSearch] =
    useState("");

  const [taskStatusFilter, setTaskStatusFilter] =
    useState<"ALL" | TaskStatus>("ALL");

  const [taskPriorityFilter, setTaskPriorityFilter] =
    useState<"ALL" | TaskPriority>("ALL");

  const [taskSort, setTaskSort] =
    useState<"position" | "priority" | "dueDate" | "createdAt">("position");


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      navigate("/login");
      return;
    }

    setUser(storedUser);

    loadDashboard();
  }, [navigate]);


  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const workspaceData =
        await getWorkspaces();

      setWorkspaces(workspaceData);

      if (workspaceData.length === 0) {
        setSelectedWorkspaceId("");
        setProjects([]);
        setSelectedProjectId("");
        setTasks([]);
        return;
      }

      const workspaceId =
        workspaceData[0].id;

      setSelectedWorkspaceId(workspaceId);

      const projectData =
        await getProjects(workspaceId);

      setProjects(projectData);

      if (projectData.length === 0) {
        setSelectedProjectId("");
        setTasks([]);
        return;
      }

      const projectId =
        projectData[0].id;

      setSelectedProjectId(projectId);

      await loadTasks(projectId);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to load dashboard."
      );

    } finally {
      setLoading(false);
    }
  }


  // =========================================================
  // LOAD TASKS
  // =========================================================

  async function loadTasks(
    projectId: string
  ) {
    try {
      const response =
        await getTasks(
          projectId,
          {
            page: 0,
            size: 100,
            sortBy: "position",
            direction: "asc",
          }
        );

      setTasks(response.content);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to load tasks."
      );
    }
  }


  // =========================================================
  // WORKSPACE SELECTION
  // =========================================================

  async function handleWorkspaceChange(
    workspaceId: string
  ) {
    setSelectedWorkspaceId(workspaceId);

    setSelectedProjectId("");

    setProjects([]);

    setTasks([]);

    try {
      setError("");

      const projectData =
        await getProjects(workspaceId);

      setProjects(projectData);

      if (projectData.length > 0) {
        const projectId =
          projectData[0].id;

        setSelectedProjectId(projectId);

        await loadTasks(projectId);
      }

    } catch (err) {
      console.error(err);

      setError(
        "Unable to load workspace."
      );
    }
  }


  // =========================================================
  // PROJECT SELECTION
  // =========================================================

  async function handleProjectChange(
    projectId: string
  ) {
    setSelectedProjectId(projectId);

    setTasks([]);

    await loadTasks(projectId);
  }


  // =========================================================
  // CREATE WORKSPACE
  // =========================================================

  async function handleCreateWorkspace(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!workspaceName.trim()) {
      return;
    }

    try {
      setError("");

      const request: CreateWorkspaceRequest = {
        name: workspaceName.trim(),
        description:
          workspaceDescription.trim() ||
          undefined,
      };

      const newWorkspace =
        await createWorkspace(request);

      setWorkspaces(
        (current) => [
          ...current,
          newWorkspace,
        ]
      );

      setSelectedWorkspaceId(
        newWorkspace.id
      );

      setProjects([]);

      setSelectedProjectId("");

      setTasks([]);

      resetWorkspaceForm();

    } catch (err) {
      console.error(err);

      setError(
        "Unable to create workspace."
      );
    }
  }


  // =========================================================
  // EDIT WORKSPACE
  // =========================================================

  function startEditingWorkspace(
    workspace: Workspace
  ) {
    setEditingWorkspaceId(
      workspace.id
    );

    setWorkspaceName(
      workspace.name
    );

    setWorkspaceDescription(
      workspace.description || ""
    );

    setShowWorkspaceForm(true);
  }


  // =========================================================
  // UPDATE WORKSPACE
  // =========================================================

  async function handleUpdateWorkspace(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !editingWorkspaceId ||
      !workspaceName.trim()
    ) {
      return;
    }

    try {
      setError("");

      const request: UpdateWorkspaceRequest = {
        name: workspaceName.trim(),
        description:
          workspaceDescription.trim(),
      };

      const updatedWorkspace =
        await updateWorkspace(
          editingWorkspaceId,
          request
        );

      setWorkspaces(
        (current) =>
          current.map(
            (workspace) =>
              workspace.id ===
              editingWorkspaceId
                ? updatedWorkspace
                : workspace
          )
      );

      resetWorkspaceForm();

    } catch (err) {
      console.error(err);

      setError(
        "Unable to update workspace."
      );
    }
  }


  // =========================================================
  // DELETE WORKSPACE
  // =========================================================

  async function handleDeleteWorkspace(
    workspace: Workspace
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete the workspace "${workspace.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteWorkspace(
        workspace.id
      );

      const remaining =
        workspaces.filter(
          (item) =>
            item.id !== workspace.id
        );

      setWorkspaces(remaining);

      if (
        selectedWorkspaceId ===
        workspace.id
      ) {
        setSelectedWorkspaceId("");

        setProjects([]);

        setSelectedProjectId("");

        setTasks([]);

        if (remaining.length > 0) {
          await handleWorkspaceChange(
            remaining[0].id
          );
        }
      }

    } catch (err) {
      console.error(err);

      setError(
        "Unable to delete workspace."
      );
    }
  }


  // =========================================================
  // RESET WORKSPACE FORM
  // =========================================================

  function resetWorkspaceForm() {
    setWorkspaceName("");

    setWorkspaceDescription("");

    setEditingWorkspaceId(null);

    setShowWorkspaceForm(false);
  }


  // =========================================================
  // CREATE PROJECT
  // =========================================================

  async function handleCreateProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !selectedWorkspaceId ||
      !projectName.trim()
    ) {
      return;
    }

    try {
      setError("");

      const request: CreateProjectRequest = {
        name: projectName.trim(),
        description:
          projectDescription.trim() ||
          undefined,
      };

      const newProject =
        await createProject(
          selectedWorkspaceId,
          request
        );

      setProjects(
        (current) => [
          ...current,
          newProject,
        ]
      );

      setSelectedProjectId(
        newProject.id
      );

      setTasks([]);

      resetProjectForm();

      await loadTasks(
        newProject.id
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to create project."
      );
    }
  }


  // =========================================================
  // EDIT PROJECT
  // =========================================================

  function startEditingProject(
    project: Project
  ) {
    setEditingProjectId(
      project.id
    );

    setProjectName(
      project.name
    );

    setProjectDescription(
      project.description || ""
    );

    setShowProjectForm(true);
  }


  // =========================================================
  // UPDATE PROJECT
  // =========================================================

  async function handleUpdateProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !editingProjectId ||
      !projectName.trim()
    ) {
      return;
    }

    try {
      setError("");

      const request: UpdateProjectRequest = {
        name: projectName.trim(),
        description:
          projectDescription.trim(),
      };

      const updatedProject =
        await updateProject(
          editingProjectId,
          request
        );

      setProjects(
        (current) =>
          current.map(
            (project) =>
              project.id ===
              editingProjectId
                ? updatedProject
                : project
          )
      );

      resetProjectForm();

    } catch (err) {
      console.error(err);

      setError(
        "Unable to update project."
      );
    }
  }


  // =========================================================
  // DELETE PROJECT
  // =========================================================

  async function handleDeleteProject(
    project: Project
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete the project "${project.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProject(
        project.id
      );

      const remaining =
        projects.filter(
          (item) =>
            item.id !== project.id
        );

      setProjects(remaining);

      if (
        selectedProjectId ===
        project.id
      ) {
        setSelectedProjectId("");

        setTasks([]);

        if (remaining.length > 0) {
          const nextProject =
            remaining[0];

          setSelectedProjectId(
            nextProject.id
          );

          await loadTasks(
            nextProject.id
          );
        }
      }

    } catch (err) {
      console.error(err);

      setError(
        "Unable to delete project."
      );
    }
  }


  // =========================================================
  // RESET PROJECT FORM
  // =========================================================

  function resetProjectForm() {
    setProjectName("");

    setProjectDescription("");

    setEditingProjectId(null);

    setShowProjectForm(false);
  }

  // =========================================================
  // EDIT TASK
  // =========================================================

    function startEditingTask(
    task: Task
  ) {
    if (task.locked) {
      setError(
        "This task is locked. Unlock it before editing."
      );
      return;
    }

    setEditingTaskId(task.id);
    setShowTaskForm(true);
  }

  // =========================================================
  // TASK FORM SUBMIT
  // =========================================================

  async function handleTaskFormSubmit(
    data:
      | CreateTaskRequest
      | UpdateTaskRequest
  ) {
    try {
      setError("");

      if (editingTaskId) {
        const updatedTask =
          await updateTask(
            editingTaskId,
            data as UpdateTaskRequest
          );

        setTasks(
          (current) =>
            current.map(
              (task) =>
                task.id === editingTaskId
                  ? updatedTask
                  : task
            )
        );
      } else {
        if (!selectedProjectId) {
          throw new Error(
            "No project selected."
          );
        }

        const newTask =
          await createTask(
            selectedProjectId,
            data as CreateTaskRequest
          );

        setTasks(
          (current) => [
            ...current,
            newTask,
          ]
        );
      }

      resetTaskForm();

    } catch (err) {
      console.error(err);

      setError(
        editingTaskId
          ? "Unable to update task."
          : "Unable to create task."
      );

      throw err;
    }
  }

  // =========================================================
  // TASK STATUS
  // =========================================================

  async function handleStatusChange(
    task: Task,
    status: TaskStatus
  ) {
    if (task.locked) {
      setError(
        "This task is locked. Unlock it before changing its status."
      );
      return;
    }

    try {
      setError("");

      const updatedTask =
        await updateTask(
          task.id,
          {
            status,
          }
        );

      setTasks(
        (current) =>
          current.map(
            (item) =>
              item.id === task.id
                ? updatedTask
                : item
          )
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to update task status."
      );
    }
  }

  async function handleTaskDrop(
  taskId: string,
  status: TaskStatus
) {
  const task = tasks.find(
    (item) => item.id === taskId
  );

  if (!task) {
    return;
  }

  if (task.locked) {
    setError(
      "This task is locked. Unlock it before moving it."
    );
    return;
  }

  if (task.status === status) {
    return;
  }

  await handleStatusChange(task, status);
}

  // =========================================================
  // PIN / UNPIN
  // =========================================================

  async function handleTogglePin(
    task: Task
  ) {
    try {
      setError("");

      const updatedTask =
        await toggleTaskPin(
          task.id
        );

      setTasks(
        (current) =>
          current.map(
            (item) =>
              item.id === task.id
                ? updatedTask
                : item
          )
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to pin or unpin task."
      );
    }
  }


  // =========================================================
  // LOCK / UNLOCK
  // =========================================================

  async function handleToggleLock(
    task: Task
  ) {
    try {
      setError("");

      const updatedTask =
        await toggleTaskLock(
          task.id
        );

      setTasks(
        (current) =>
          current.map(
            (item) =>
              item.id === task.id
                ? updatedTask
                : item
          )
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to lock or unlock task."
      );
    }
  }


  // =========================================================
  // ARCHIVE
  // =========================================================

  async function handleArchive(
    task: Task
  ) {
    const confirmed =
      window.confirm(
        `Archive "${task.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await archiveTask(
        task.id
      );

      setTasks(
        (current) =>
          current.filter(
            (item) =>
              item.id !== task.id
          )
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to archive task."
      );
    }
  }


  // =========================================================
  // DUPLICATE
  // =========================================================

  async function handleDuplicate(
    task: Task
  ) {
    try {
      setError("");

      const duplicatedTask =
        await duplicateTask(
          task.id
        );

      setTasks(
        (current) => [
          ...current,
          duplicatedTask,
        ]
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to duplicate task."
      );
    }
  }


  // =========================================================
  // DELETE TASK / TRASH
  // =========================================================

  async function handleDeleteTask(
    task: Task
  ) {
    const confirmed =
      window.confirm(
        `Move "${task.title}" to trash?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteTask(
        task.id
      );

      setTasks(
        (current) =>
          current.filter(
            (item) =>
              item.id !== task.id
          )
      );

    } catch (err) {
      console.error(err);

      setError(
        "Unable to move task to trash."
      );
    }
  }


  // =========================================================
  // RESET TASK FORM
  // =========================================================

  const filteredTasks = tasks
    .filter((task) => {
      const search = taskSearch.trim().toLowerCase();
      if (!search) return true;
      return (
        task.title.toLowerCase().includes(search) ||
        (task.description || "").toLowerCase().includes(search)
      );
    })
    .filter((task) => taskStatusFilter === "ALL" || task.status === taskStatusFilter)
    .filter((task) => taskPriorityFilter === "ALL" || task.priority === taskPriorityFilter)
    .slice()
    .sort((a, b) => {
      if (taskSort === "priority") {
        const order: Record<TaskPriority, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (taskSort === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (taskSort === "createdAt") return b.createdAt.localeCompare(a.createdAt);
      return a.position - b.position;
    });

  const taskCounts = {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "TODO").length,
    inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
    completed: tasks.filter((task) => task.status === "COMPLETED").length,
    cancelled: tasks.filter((task) => task.status === "CANCELLED").length,
  };

  function resetTaskFilters() {
    setTaskSearch("");
    setTaskStatusFilter("ALL");
    setTaskPriorityFilter("ALL");
    setTaskSort("position");
  }
  function resetTaskForm() {
    setEditingTaskId(null);
    setShowTaskForm(false);
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    logout();

    navigate("/login");
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading TaskFlow...
      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <Navbar />

      <Sidebar
        workspaces={workspaces}
        projects={projects}
        selectedWorkspaceId={
          selectedWorkspaceId
        }
        selectedProjectId={
          selectedProjectId
        }
        onWorkspaceSelect={
          handleWorkspaceChange
        }
        onProjectSelect={
          handleProjectChange
        }
        onCreateWorkspace={() => {
          resetWorkspaceForm();
          setShowWorkspaceForm(true);
        }}
        onCreateProject={() => {
          if (!selectedWorkspaceId) {
            setError(
              "Please select a workspace first."
            );
            return;
          }

          resetProjectForm();
          setShowProjectForm(true);
        }}
        onEditWorkspace={
          startEditingWorkspace
        }
        onDeleteWorkspace={
          handleDeleteWorkspace
        }
        onEditProject={
          startEditingProject
        }
        onDeleteProject={
          handleDeleteProject
        }
      />

      <main className="dashboard-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-header">

          <div>
            <h1>TaskFlow</h1>

            <p>
              Welcome back,{" "}
              <strong>
                {user?.name}
              </strong>
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Logout
          </button>

        </header>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="error-message dashboard-error">

            {error}

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}


        {/* =================================================
            WORKSPACE MANAGEMENT
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>
                Workspace
              </h2>

              <p>
                Manage your TaskFlow
                workspaces.
              </p>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                resetWorkspaceForm();
                setShowWorkspaceForm(true);
              }}
            >
              + New Workspace
            </button>

          </div>


          {showWorkspaceForm && (
            <form
              className="task-form"
              onSubmit={
                editingWorkspaceId
                  ? handleUpdateWorkspace
                  : handleCreateWorkspace
              }
            >

              <h3>
                {editingWorkspaceId
                  ? "Edit Workspace"
                  : "Create Workspace"}
              </h3>

              <div className="form-group">

                <label>
                  Workspace Name
                </label>

                <input
                  value={workspaceName}
                  onChange={(event) =>
                    setWorkspaceName(
                      event.target.value
                    )
                  }
                  placeholder="Enter workspace name"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={
                    workspaceDescription
                  }
                  onChange={(event) =>
                    setWorkspaceDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the workspace..."
                  rows={3}
                />

              </div>

              <div className="task-form-actions">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    resetWorkspaceForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingWorkspaceId
                    ? "Save Changes"
                    : "Create Workspace"}
                </button>

              </div>

            </form>
          )}


          {workspaces.length === 0 ? (

            <div className="empty-state">

              <h3>
                No workspace
              </h3>

              <p>
                Create your first workspace
                to get started.
              </p>

            </div>

          ) : (

            <div className="workspace-list">

              {workspaces.map(
                (workspace) => (

                  <div
                    className={
                      "workspace-card " +
                      (
                        selectedWorkspaceId ===
                        workspace.id
                          ? "selected"
                          : ""
                      )
                    }
                    key={workspace.id}
                  >

                    <button
                      type="button"
                      className="workspace-card-main"
                      onClick={() =>
                        handleWorkspaceChange(
                          workspace.id
                        )
                      }
                    >

                      <h3>
                        {workspace.name}
                      </h3>

                      <p>
                        {workspace.description ||
                          "No description"}
                      </p>

                    </button>

                    <div className="workspace-card-actions">

                      <button
                        type="button"
                        className="task-action-button"
                        onClick={() =>
                          startEditingWorkspace(
                            workspace
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="task-action-button delete"
                        onClick={() =>
                          handleDeleteWorkspace(
                            workspace
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            PROJECT MANAGEMENT
        ================================================= */}
        {/* =================================================
            WORKSPACE MEMBERS
        ================================================= */}

        {selectedWorkspaceId && user && (
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2>Workspace Members</h2>
                <p>
                  Manage members and their workspace roles.
                </p>
              </div>
            </div>

            <WorkspaceMembers
              workspaceId={selectedWorkspaceId}
              currentUserId={user.id}
              isOwner={
                workspaces.find(
                  (workspace) =>
                    workspace.id === selectedWorkspaceId
                )?.ownerId === user.id
              }
              isAdmin={
                workspaces.find(
                  (workspace) =>
                    workspace.id === selectedWorkspaceId
                )?.ownerId === user.id
              }
            />
          </section>
        )}
        {selectedWorkspaceId && (
          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>
                  Projects
                </h2>

                <p>
                  Manage projects inside the
                  selected workspace.
                </p>
              </div>

              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  resetProjectForm();
                  setShowProjectForm(true);
                }}
              >
                + New Project
              </button>

            </div>


            {showProjectForm && (
              <form
                className="task-form"
                onSubmit={
                  editingProjectId
                    ? handleUpdateProject
                    : handleCreateProject
                }
              >

                <h3>
                  {editingProjectId
                    ? "Edit Project"
                    : "Create Project"}
                </h3>

                <div className="form-group">

                  <label>
                    Project Name
                  </label>

                  <input
                    value={projectName}
                    onChange={(event) =>
                      setProjectName(
                        event.target.value
                      )
                    }
                    placeholder="Enter project name"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Description
                  </label>

                  <textarea
                    value={
                      projectDescription
                    }
                    onChange={(event) =>
                      setProjectDescription(
                        event.target.value
                      )
                    }
                    placeholder="Describe the project..."
                    rows={3}
                  />

                </div>

                <div className="task-form-actions">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      resetProjectForm
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingProjectId
                      ? "Save Changes"
                      : "Create Project"}
                  </button>

                </div>

              </form>
            )}


            {projects.length === 0 ? (

              <div className="empty-state">

                <h3>
                  No projects
                </h3>

                <p>
                  Create a project inside this
                  workspace.
                </p>

              </div>

            ) : (

              <div className="project-list">

                {projects.map(
                  (project) => (

                    <div
                      className={
                        "project-card " +
                        (
                          selectedProjectId ===
                          project.id
                            ? "selected"
                            : ""
                        )
                      }
                      key={project.id}
                    >

                      <button
                        type="button"
                        className="project-card-main"
                        onClick={() =>
                          handleProjectChange(
                            project.id
                          )
                        }
                      >

                        <h3>
                          {project.name}
                        </h3>

                        <p>
                          {project.description ||
                            "No description"}
                        </p>

                      </button>

                      <div className="project-card-actions">

                        <button
                          type="button"
                          className="task-action-button"
                          onClick={() =>
                            startEditingProject(
                              project
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="task-action-button delete"
                          onClick={() =>
                            handleDeleteProject(
                              project
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>
        )}


        {/* =================================================
            TASK MANAGEMENT
        ================================================= */}

        {selectedProjectId && (
          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Tasks
                </h2>

                <p>
                  Manage tasks for the selected
                  project.
                </p>

              </div>

              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {

                  if (showTaskForm) {
                    resetTaskForm();
                  } else {
                    setShowTaskForm(true);
                  }

                }}
              >
                {showTaskForm
                  ? "Cancel"
                  : "+ New Task"}
              </button>

            </div>


                        {/* TASK FORM */}

            {showTaskForm && (
              <TaskForm
                task={
                  editingTaskId
                    ? tasks.find(
                        (task) =>
                          task.id ===
                          editingTaskId
                      ) ?? null
                    : null
                }
                onSubmit={
                  handleTaskFormSubmit
                }
                onCancel={
                  resetTaskForm
                }
                loading={false}
              />
            )}


            <div className="task-form">
              <h3>Find Tasks</h3>
              <div className="task-form-row">
                <div className="form-group">
                  <label>Search</label>
                  <input type="search" value={taskSearch} onChange={(event) => setTaskSearch(event.target.value)} placeholder="Search title or description..." />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={taskStatusFilter} onChange={(event) => setTaskStatusFilter(event.target.value as "ALL" | TaskStatus)}>
                    <option value="ALL">All statuses</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskPriorityFilter} onChange={(event) => setTaskPriorityFilter(event.target.value as "ALL" | TaskPriority)}>
                    <option value="ALL">All priorities</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sort</label>
                  <select value={taskSort} onChange={(event) => setTaskSort(event.target.value as "position" | "priority" | "dueDate" | "createdAt")}>
                    <option value="position">Board order</option>
                    <option value="priority">Priority</option>
                    <option value="dueDate">Due date</option>
                    <option value="createdAt">Newest</option>
                  </select>
                </div>
              </div>
              <div className="task-form-actions">
                <span>Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks</span>
                <button type="button" className="btn btn-secondary" onClick={resetTaskFilters}>Clear Filters</button>
              </div>
            </div>

            <div className="workspace-list">
              <div className="workspace-card"><div className="workspace-card-main"><h3>Total</h3><p>{taskCounts.total} tasks</p></div></div>
              <div className="workspace-card"><div className="workspace-card-main"><h3>To Do</h3><p>{taskCounts.todo} tasks</p></div></div>
              <div className="workspace-card"><div className="workspace-card-main"><h3>In Progress</h3><p>{taskCounts.inProgress} tasks</p></div></div>
              <div className="workspace-card"><div className="workspace-card-main"><h3>Completed</h3><p>{taskCounts.completed} tasks</p></div></div>
              <div className="workspace-card"><div className="workspace-card-main"><h3>Cancelled</h3><p>{taskCounts.cancelled} tasks</p></div></div>
            </div>

            {/* TASK BOARD */}

            <TaskBoard
  tasks={filteredTasks}
  onEdit={startEditingTask}
  onDelete={handleDeleteTask}
  onTogglePin={handleTogglePin}
  onToggleLock={handleToggleLock}
  onArchive={handleArchive}
  onDuplicate={handleDuplicate}
  onStatusChange={
    handleStatusChange
  }
  onTaskDrop={
    handleTaskDrop
  }
/>

          </section>
        )}

      </main>
    </>
  );
}