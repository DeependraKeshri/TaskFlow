export type TaskBlockType = "TITLE" | "SUBTITLE" | "HEADING" | "PARAGRAPH" | "CHECKLIST" | "BULLET_LIST" | "NUMBERED_LIST" | "QUOTE" | "CODE" | "TABLE";

export interface TaskBlock {
  id: string;
  taskId: string;
  blockType: TaskBlockType;
  content: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskBlockRequest {
  blockType: TaskBlockType;
  content?: string;
  position?: number;
}
