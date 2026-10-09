import api from "./axios";

export interface TaskDoodle {
  id: string;
  taskId: string;
  imageData: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDoodleRequest {
  imageData: string;
}

export async function getTaskDoodle(
  taskId: string
): Promise<TaskDoodle | null> {
  try {
    const response =
      await api.get<TaskDoodle>(
        `/tasks/${taskId}/doodle`
      );

    if (response.status === 204) {
      return null;
    }

    return response.data;
  } catch (error: any) {
    if (
      error?.response?.status === 404 ||
      error?.response?.status === 204
    ) {
      return null;
    }

    throw error;
  }
}

export async function saveTaskDoodle(
  taskId: string,
  imageData: string
): Promise<TaskDoodle> {
  const response =
    await api.put<TaskDoodle>(
      `/tasks/${taskId}/doodle`,
      {
        imageData,
      } satisfies TaskDoodleRequest
    );

  return response.data;
}

export async function deleteTaskDoodle(
  taskId: string
): Promise<void> {
  await api.delete(
    `/tasks/${taskId}/doodle`
  );
}