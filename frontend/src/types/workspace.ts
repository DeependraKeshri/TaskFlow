export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}