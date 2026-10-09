import api from "./axios";
import type {
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from "../types/project";

export async function getProjects(
  workspaceId: string
): Promise<Project[]> {
  const response = await api.get<Project[]>(
    `/workspaces/${workspaceId}/projects`
  );

  return response.data;
}

export async function getProject(
  projectId: string
): Promise<Project> {
  const response = await api.get<Project>(
    `/projects/${projectId}`
  );

  return response.data;
}

export async function createProject(
  workspaceId: string,
  request: CreateProjectRequest
): Promise<Project> {
  const response = await api.post<Project>(
    `/workspaces/${workspaceId}/projects`,
    request
  );

  return response.data;
}

export async function updateProject(
  projectId: string,
  request: UpdateProjectRequest
): Promise<Project> {
  const response = await api.patch<Project>(
    `/projects/${projectId}`,
    request
  );

  return response.data;
}

export async function deleteProject(
  projectId: string
): Promise<void> {
  await api.delete(
    `/projects/${projectId}`
  );
}