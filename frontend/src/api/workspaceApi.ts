import api from "./axios";

import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  Workspace,
} from "../types/workspace";

export async function getWorkspaces(): Promise<Workspace[]> {
  const response = await api.get<Workspace[]>("/workspaces");

  return response.data;
}

export async function getWorkspace(
  workspaceId: string
): Promise<Workspace> {
  const response = await api.get<Workspace>(
    `/workspaces/${workspaceId}`
  );

  return response.data;
}

export async function createWorkspace(
  request: CreateWorkspaceRequest
): Promise<Workspace> {
  const response = await api.post<Workspace>(
    "/workspaces",
    request
  );

  return response.data;
}

export async function updateWorkspace(
  workspaceId: string,
  request: UpdateWorkspaceRequest
): Promise<Workspace> {
  const response = await api.patch<Workspace>(
    `/workspaces/${workspaceId}`,
    request
  );

  return response.data;
}

export async function deleteWorkspace(
  workspaceId: string
): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}`);
}