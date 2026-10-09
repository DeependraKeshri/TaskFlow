import api from "./axios";

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface WorkspaceMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: WorkspaceRole;
}

export interface AddWorkspaceMemberRequest {
  email: string;
  role: Exclude<WorkspaceRole, "OWNER">;
}

export interface UpdateWorkspaceMemberRequest {
  role: Exclude<WorkspaceRole, "OWNER">;
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const response = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
  return response.data;
}

export async function addWorkspaceMember(workspaceId: string, request: AddWorkspaceMemberRequest): Promise<WorkspaceMember> {
  const response = await api.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, request);
  return response.data;
}

export async function updateWorkspaceMember(workspaceId: string, memberId: string, request: UpdateWorkspaceMemberRequest): Promise<WorkspaceMember> {
  const response = await api.patch<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}`, request);
  return response.data;
}

export async function removeWorkspaceMember(workspaceId: string, memberId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
}
