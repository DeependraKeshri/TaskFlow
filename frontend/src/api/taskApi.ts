import api from "./axios";

import type {
  CreateTaskRequest,
  PageResponse,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest,
} from "../types/task";

interface GetTasksParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}


/*
 * =========================================================
 * PROJECT TASKS
 * =========================================================
 */

export async function getTasks(
  projectId: string,
  params?: GetTasksParams
): Promise<PageResponse<Task>> {

  const response =
    await api.get<PageResponse<Task>>(
      `/projects/${projectId}/tasks`,
      {
        params,
      }
    );

  return response.data;
}


/*
 * =========================================================
 * SINGLE TASK
 * =========================================================
 */

export async function getTask(
  taskId: string
): Promise<Task> {

  const response =
    await api.get<Task>(
      `/tasks/${taskId}`
    );

  return response.data;
}


/*
 * =========================================================
 * CREATE
 * =========================================================
 */

export async function createTask(
  projectId: string,
  request: CreateTaskRequest
): Promise<Task> {

  const response =
    await api.post<Task>(
      `/projects/${projectId}/tasks`,
      request
    );

  return response.data;
}


/*
 * =========================================================
 * UPDATE
 * =========================================================
 */

export async function updateTask(
  taskId: string,
  request: UpdateTaskRequest
): Promise<Task> {

  const response =
    await api.patch<Task>(
      `/tasks/${taskId}`,
      request
    );

  return response.data;
}


/*
 * =========================================================
 * SOFT DELETE
 * =========================================================
 */

export async function deleteTask(
  taskId: string
): Promise<void> {

  await api.delete(
    `/tasks/${taskId}`
  );
}


/*
 * =========================================================
 * PIN / UNPIN
 * =========================================================
 */

export async function toggleTaskPin(
  taskId: string
): Promise<Task> {

  const response =
    await api.patch<Task>(
      `/tasks/${taskId}/pin`
    );

  return response.data;
}


/*
 * =========================================================
 * LOCK / UNLOCK
 * =========================================================
 */

export async function toggleTaskLock(
  taskId: string
): Promise<Task> {

  const response =
    await api.patch<Task>(
      `/tasks/${taskId}/lock`
    );

  return response.data;
}


/*
 * =========================================================
 * ARCHIVE
 * =========================================================
 */

export async function archiveTask(
  taskId: string
): Promise<Task> {

  const response =
    await api.patch<Task>(
      `/tasks/${taskId}/archive`
    );

  return response.data;
}


/*
 * =========================================================
 * RESTORE ARCHIVE
 * =========================================================
 */

export async function restoreArchivedTask(
  taskId: string
): Promise<Task> {

  const response =
    await api.patch<Task>(
      `/tasks/${taskId}/restore-archive`
    );

  return response.data;
}


/*
 * =========================================================
 * MOVE TO TRASH
 * =========================================================
 */

export async function moveTaskToTrash(
  taskId: string
): Promise<Task> {

  const response =
    await api.patch<Task>(
      `/tasks/${taskId}/trash`
    );

  return response.data;
}


/*
 * =========================================================
 * RESTORE FROM TRASH
 * =========================================================
 */

export async function restoreTaskFromTrash(
  taskId: string
): Promise<Task> {

  const response =
    await api.patch<Task>(
      `/tasks/${taskId}/restore`
    );

  return response.data;
}


/*
 * =========================================================
 * PERMANENT DELETE
 * =========================================================
 */

export async function permanentlyDeleteTask(
  taskId: string
): Promise<void> {

  await api.delete(
    `/tasks/${taskId}/permanent`
  );
}


/*
 * =========================================================
 * DUPLICATE
 * =========================================================
 */

export async function duplicateTask(
  taskId: string
): Promise<Task> {

  const response =
    await api.post<Task>(
      `/tasks/${taskId}/duplicate`
    );

  return response.data;
}


/*
 * =========================================================
 * GET ARCHIVED TASKS
 * =========================================================
 */

export async function getArchivedTasks(
  page = 0,
  size = 20
): Promise<PageResponse<Task>> {

  const response =
    await api.get<PageResponse<Task>>(
      `/tasks/archived`,
      {
        params: {
          page,
          size,
        },
      }
    );

  return response.data;
}

/*
 * =========================================================
 * GET TODAY TASKS
 * =========================================================
 */

export async function getTodayTasks(
  page = 0,
  size = 50
): Promise<PageResponse<Task>> {

  const response =
    await api.get<PageResponse<Task>>(
      `/tasks/today`,
      {
        params: {
          page,
          size,
        },
      }
    );

  return response.data;
}


/*
 * =========================================================
 * GET UPCOMING TASKS
 * =========================================================
 */

export async function getUpcomingTasks(
  page = 0,
  size = 50
): Promise<PageResponse<Task>> {

  const response =
    await api.get<PageResponse<Task>>(
      `/tasks/upcoming`,
      {
        params: {
          page,
          size,
        },
      }
    );

  return response.data;
}
/*
 * =========================================================
 * GET TRASHED TASKS
 * =========================================================
 */

export async function getTrashTasks(
  page = 0,
  size = 20
): Promise<PageResponse<Task>> {

  const response =
    await api.get<PageResponse<Task>>(
      `/tasks/trash`,
      {
        params: {
          page,
          size,
        },
      }
    );

  return response.data;
}