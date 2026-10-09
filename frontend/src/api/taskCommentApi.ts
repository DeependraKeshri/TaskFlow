import api from "./axios";

export type TaskComment = {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies: TaskComment[];
};

export type TaskCommentRequest = {
  content: string;
  parentCommentId?: string | null;
};

export async function getTaskComments(
  taskId: string,
  page = 0,
  size = 50
): Promise<TaskCommentPage> {
  const response = await api.get<TaskCommentPage>(
    `/tasks/${taskId}/comments`,
    {
      params: { page, size },
    }
  );

  return response.data;
}

export async function createTaskComment(
  taskId: string,
  request: TaskCommentRequest
): Promise<TaskComment> {
  const response = await api.post<TaskComment>(
    `/tasks/${taskId}/comments`,
    request
  );

  return response.data;
}

export async function updateTaskComment(
  taskId: string,
  commentId: string,
  request: TaskCommentRequest
): Promise<TaskComment> {
  const response = await api.put<TaskComment>(
    `/tasks/${taskId}/comments/${commentId}`,
    request
  );

  return response.data;
}

export async function deleteTaskComment(
  taskId: string,
  commentId: string
): Promise<void> {
  await api.delete(`/tasks/${taskId}/comments/${commentId}`);
}

export type TaskCommentPage = {
  content: TaskComment[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};