import api from "./axios";
import type { Attachment } from "../types/attachment";

export async function getTaskAttachments(
  taskId: string
): Promise<Attachment[]> {
  const response = await api.get<Attachment[]>(
    `/tasks/${taskId}/attachments`
  );

  return response.data;
}

export async function uploadTaskAttachment(
  taskId: string,
  file: File
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<Attachment>(
    `/tasks/${taskId}/attachments`,
    formData
  );

  return response.data;
}

export async function downloadAttachment(
  attachmentId: string
): Promise<Blob> {
  const response = await api.get<Blob>(
    `/attachments/${attachmentId}/download`,
    { responseType: "blob" }
  );

  return response.data;
}

export async function deleteAttachment(
  attachmentId: string
): Promise<void> {
  await api.delete(`/attachments/${attachmentId}`);
}
