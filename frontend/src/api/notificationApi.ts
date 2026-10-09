import api from "./axios";

export type NotificationType =
  | "COMMENT_MENTION"
  | "TASK_COMMENT"
  | "COMMENT_REPLY";

export type TaskNotification = {
  id: string;
  recipientId: string;
  actorId: string | null;
  actorName: string | null;
  taskId: string | null;
  taskTitle: string | null;
  commentId: string | null;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationPage = {
  content: TaskNotification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

export async function getNotifications(
  page = 0,
  size = 50
): Promise<NotificationPage> {
  const response = await api.get<NotificationPage>("/notifications", {
    params: { page, size },
  });

  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await api.get<number>("/notifications/unread-count");
  return response.data;
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  await api.put(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.put("/notifications/read-all");
}
