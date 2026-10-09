import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStoredUser } from "../api/authApi";

import { getWorkspaces } from "../api/workspaceApi";

import { getProjects } from "../api/projectApi";

import type { Workspace } from "../types/workspace";
import type { Project } from "../types/project";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";


interface AppShellProps {
  children: React.ReactNode;
}


export default function AppShell({
  children,
}: AppShellProps) {

  const navigate = useNavigate();


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState("");

  const [selectedProjectId, setSelectedProjectId] =
    useState("");


  /*
   * =========================================================
   * LOAD INITIAL DATA
   * =========================================================
   */

  useEffect(() => {

    const user =
      getStoredUser();

    if (!user) {

      navigate("/login");

      return;
    }

    loadNavigation();

  }, [navigate]);


  /*
   * =========================================================
   * LOAD WORKSPACES + PROJECTS
   * =========================================================
   */

  async function loadNavigation() {

    try {

      const workspaceData =
        await getWorkspaces();

      setWorkspaces(
        workspaceData
      );


      if (workspaceData.length === 0) {

        setSelectedWorkspaceId("");
        setProjects([]);
        setSelectedProjectId("");

        return;
      }


      const workspaceId =
        workspaceData[0].id;

      setSelectedWorkspaceId(
        workspaceId
      );


      const projectData =
        await getProjects(
          workspaceId
        );

      setProjects(
        projectData
      );


      if (projectData.length > 0) {

        setSelectedProjectId(
          projectData[0].id
        );

      } else {

        setSelectedProjectId("");

      }

    } catch (error) {

      console.error(
        "Unable to load application navigation:",
        error
      );

    }

  }


  /*
   * =========================================================
   * WORKSPACE SELECT
   * =========================================================
   */

  async function handleWorkspaceSelect(
    workspaceId: string
  ) {

    setSelectedWorkspaceId(
      workspaceId
    );

    setSelectedProjectId("");

    setProjects([]);


    try {

      const projectData =
        await getProjects(
          workspaceId
        );

      setProjects(
        projectData
      );


      if (projectData.length > 0) {

        setSelectedProjectId(
          projectData[0].id
        );

      }

    } catch (error) {

      console.error(
        "Unable to load workspace projects:",
        error
      );

    }

  }


  /*
   * =========================================================
   * PROJECT SELECT
   * =========================================================
   */

  function handleProjectSelect(
    projectId: string
  ) {

    setSelectedProjectId(
      projectId
    );

    /*
     * Dashboard currently owns the
     * project task-board state.
     */

    navigate("/dashboard");

  }


  /*
   * =========================================================
   * CREATE WORKSPACE
   * =========================================================
   */

  function handleCreateWorkspace() {

    /*
     * Workspace creation UI currently
     * lives inside Dashboard.
     */

    navigate("/dashboard");

  }


  /*
   * =========================================================
   * CREATE PROJECT
   * =========================================================
   */

  function handleCreateProject() {

    /*
     * Project creation UI currently
     * lives inside Dashboard.
     */

    navigate("/dashboard");

  }


  /*
   * =========================================================
   * EDIT WORKSPACE
   * =========================================================
   */

  function handleEditWorkspace(
    workspace: Workspace
  ) {

    /*
     * Dashboard currently owns the
     * workspace edit form.
     */

    console.log(
      "Edit workspace:",
      workspace.id
    );

    navigate("/dashboard");

  }


  /*
   * =========================================================
   * DELETE WORKSPACE
   * =========================================================
   */

  function handleDeleteWorkspace(
    workspace: Workspace
  ) {

    /*
     * Dashboard currently owns the
     * workspace deletion flow.
     */

    console.log(
      "Delete workspace:",
      workspace.id
    );

    navigate("/dashboard");

  }


  /*
   * =========================================================
   * EDIT PROJECT
   * =========================================================
   */

  function handleEditProject(
    project: Project
  ) {

    console.log(
      "Edit project:",
      project.id
    );

    navigate("/dashboard");

  }


  /*
   * =========================================================
   * DELETE PROJECT
   * =========================================================
   */

  function handleDeleteProject(
    project: Project
  ) {

    console.log(
      "Delete project:",
      project.id
    );

    navigate("/dashboard");

  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      <Navbar />


      <Sidebar

        workspaces={
          workspaces
        }

        projects={
          projects
        }

        selectedWorkspaceId={
          selectedWorkspaceId
        }

        selectedProjectId={
          selectedProjectId
        }

        onWorkspaceSelect={
          handleWorkspaceSelect
        }

        onProjectSelect={
          handleProjectSelect
        }

        onCreateWorkspace={
          handleCreateWorkspace
        }

        onCreateProject={
          handleCreateProject
        }

        onEditWorkspace={
          handleEditWorkspace
        }

        onDeleteWorkspace={
          handleDeleteWorkspace
        }

        onEditProject={
          handleEditProject
        }

        onDeleteProject={
          handleDeleteProject
        }

      />


      {children}

    </>

  );

}