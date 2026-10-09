export interface Attachment {
  id: string;
  taskId: string;
  originalFileName: string;
  contentType: string | null;
  fileSize: number;
  createdAt: string;
}
