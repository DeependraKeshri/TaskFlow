import api from "./axios";
import type { TaskBlock, TaskBlockRequest } from "../types/taskBlock";

export async function getTaskBlocks(taskId: string): Promise<TaskBlock[]> {
  const response = await api.get<TaskBlock[]>(`/tasks/${taskId}/blocks`);
  return response.data;
}

export async function createTaskBlock(taskId: string, request: TaskBlockRequest): Promise<TaskBlock> {
  const response = await api.post<TaskBlock>(`/tasks/${taskId}/blocks`, request);
  return response.data;
}

export async function updateTaskBlock(blockId: string, request: TaskBlockRequest): Promise<TaskBlock> {
  const response = await api.put<TaskBlock>(`/task-blocks/${blockId}`, request);
  return response.data;
}

export async function deleteTaskBlock(blockId: string): Promise<void> {
  await api.delete(`/task-blocks/${blockId}`);
}

export async function replaceTaskBlocks(taskId: string, blocks: TaskBlockRequest[]): Promise<TaskBlock[]> {
  const response = await api.put<TaskBlock[]>(`/tasks/${taskId}/blocks`, blocks);
  return response.data;
}
