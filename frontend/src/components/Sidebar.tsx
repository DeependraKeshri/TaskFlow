import { useLocation, useNavigate } from "react-router-dom";

import type { Project } from "../types/project";
import type { Workspace } from "../types/workspace";

interface SidebarProps {
  workspaces?: Workspace[];
  projects?: Project[];

  selectedWorkspaceId?: string;
  selectedProjectId?: string;

  onWorkspaceSelect?: (workspaceId: string) => void;
  onProjectSelect?: (projectId: string) => void;

  onCreateWorkspace?: () => void;
  onCreateProject?: () => void;

  onEditWorkspace?: (workspace: Workspace) => void;
  onDeleteWorkspace?: (workspace: Workspace) => void;

  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

function SidebarIcon({
  type,
}: {
  type:
    | "dashboard"
    | "tasks"
    | "today"
    | "upcoming"
    | "shared"
    | "archive"
    | "trash"
    | "settings"
    | "edit"
    | "delete";
}) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "tasks":
      return (
        <svg {...common}>
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <path d="M4 6h.01" />
          <path d="M4 12h.01" />
          <path d="M4 18h.01" />
        </svg>
      );

    case "today":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
        </svg>
      );

    case "upcoming":
      return (
        <svg {...common}>
          <path d="M4 12h16" />
          <path d="m14 6 6 6-6 6" />
        </svg>
      );

    case "shared":
      return (
        <svg {...common}>
          <circle cx="9" cy="7" r="3" />
          <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
          <path d="M16 4.5a3 3 0 0 1 0 5.8" />
          <path d="M18 14a5 5 0 0 1 3 4.5V21" />
        </svg>
      );

    case "archive":
      return (
        <svg {...common}>
          <path d="M4 4h16v4H4z" />
          <path d="M5 8v11h14V8" />
          <path d="M9 12h6" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.1 1Z" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );

    case "delete":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    default:
      return null;
  }
}

export default function Sidebar({
  workspaces = [],
  projects = [],

  selectedWorkspaceId = "",
  selectedProjectId = "",

  onWorkspaceSelect = () => {},
  onProjectSelect = () => {},

  onCreateWorkspace = () => {},
  onCreateProject = () => {},

  onEditWorkspace = () => {},
  onDeleteWorkspace = () => {},

  onEditProject = () => {},
  onDeleteProject = () => {},
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path: string): boolean {
    return location.pathname === path;
  }

  return (
    <aside className="app-sidebar">
      {/* MAIN */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">MAIN</div>

        <button
          type="button"
          className={`sidebar-item ${
            isActive("/dashboard") ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <span className="sidebar-icon">
            <SidebarIcon type="dashboard" />
          </span>
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            isActive("/dashboard") ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <span className="sidebar-icon">
            <SidebarIcon type="tasks" />
          </span>
          <span>All Tasks</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            isActive("/today") ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/today")}
        >
          <span className="sidebar-icon">
            <SidebarIcon type="today" />
          </span>
          <span>Today</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            isActive("/upcoming") ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/upcoming")}
        >
          <span className="sidebar-icon">
            <SidebarIcon type="upcoming" />
          </span>
          <span>Upcoming</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            isActive("/shared-with-me") ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/shared-with-me")}
        >
          <span className="sidebar-icon">
            <SidebarIcon type="shared" />
          </span>
          <span>Shared With Me</span>
        </button>
      </div>

      {/* WORKSPACES */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">WORKSPACES</span>

          <button
            type="button"
            className="sidebar-add-button"
            title="Create workspace"
            onClick={onCreateWorkspace}
          >
            +
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="sidebar-empty">No workspaces</div>
        ) : (
          workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`sidebar-resource ${
                selectedWorkspaceId === workspace.id ? "active" : ""
              }`}
            >
              <button
                type="button"
                className="sidebar-item sidebar-resource-main"
                onClick={() => onWorkspaceSelect(workspace.id)}
              >
                <span className="sidebar-workspace-dot" />

                <span className="sidebar-item-text">
                  {workspace.name}
                </span>
              </button>

              <div className="sidebar-resource-actions">
                <button
                  type="button"
                  className="sidebar-action-button"
                  title="Edit workspace"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditWorkspace(workspace);
                  }}
                >
                  <SidebarIcon type="edit" />
                </button>

                <button
                  type="button"
                  className="sidebar-action-button sidebar-delete-button"
                  title="Delete workspace"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteWorkspace(workspace);
                  }}
                >
                  <SidebarIcon type="delete" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PROJECTS */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">PROJECTS</span>

          <button
            type="button"
            className="sidebar-add-button"
            title="Create project"
            onClick={onCreateProject}
          >
            +
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="sidebar-empty">No projects</div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`sidebar-resource ${
                selectedProjectId === project.id ? "active" : ""
              }`}
            >
              <button
                type="button"
                className="sidebar-item sidebar-resource-main"
                onClick={() => onProjectSelect(project.id)}
              >
                <span className="sidebar-project-dot" />

                <span className="sidebar-item-text">
                  {project.name}
                </span>
              </button>

              <div className="sidebar-resource-actions">
                <button
                  type="button"
                  className="sidebar-action-button"
                  title="Edit project"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditProject(project);
                  }}
                >
                  <SidebarIcon type="edit" />
                </button>

                <button
                  type="button"
                  className="sidebar-action-button sidebar-delete-button"
                  title="Delete project"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteProject(project);
                  }}
                >
                  <SidebarIcon type="delete" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TASK MANAGEMENT */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">TASK MANAGEMENT</div>

        <button
          type="button"
          className={`sidebar-item ${
            isActive("/archive") ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/archive")}
        >
          <span className="sidebar-icon">
            <SidebarIcon type="archive" />
          </span>
          <span>Archive</span>
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            isActive("/trash") ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/trash")}
        >
          <span className="sidebar-icon">
            <SidebarIcon type="trash" />
          </span>
          <span>Trash</span>
        </button>
      </div>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        <button
          type="button"
          className={`sidebar-item ${
            isActive("/settings") ? "sidebar-item-active" : ""
          }`}
          onClick={() => navigate("/settings")}
        >
          <span className="sidebar-icon">
            <SidebarIcon type="settings" />
          </span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}