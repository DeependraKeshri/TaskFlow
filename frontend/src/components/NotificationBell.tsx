import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type TaskNotification,
} from "../api/notificationApi";

export default function NotificationBell() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      const [page, count] = await Promise.all([
        getNotifications(0, 20),
        getUnreadNotificationCount(),
      ]);

      setNotifications(page.content);
      setUnreadCount(count);
        } catch (error) {
      console.error(
        "NotificationBell failed to load notifications:",
        error
      );
    }
  }

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleNotificationClick(
    notification: TaskNotification
  ) {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read: true,
                  readAt: new Date().toISOString(),
                }
              : item
          )
        );

        setUnreadCount((current) => Math.max(0, current - 1));
      } catch {
        // Continue navigation if marking as read fails.
      }
    }

    setOpen(false);

    if (notification.taskId) {
      navigate(`/tasks/${notification.taskId}`);
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return;
    }

    setLoading(true);

    try {
      await markAllNotificationsAsRead();

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
          readAt: notification.readAt ?? now,
        }))
      );

      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }

  function getIcon(type: TaskNotification["type"]) {
    if (type === "COMMENT_MENTION") {
      return "@";
    }

    if (type === "COMMENT_REPLY") {
      return "↩";
    }

    return "💬";
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
      }}
    >
      <button
        type="button"
        className="navbar-icon-button"
        title="Notifications"
        onClick={() => setOpen((value) => !value)}
        style={{
          position: "relative",
        }}
      >
        🔔

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 19,
              height: 19,
              padding: "0 5px",
              borderRadius: 999,
              background: "#dc2626",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ffffff",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            width: 380,
            maxWidth: "calc(100vw - 32px)",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            boxShadow: "0 15px 40px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <strong>Notifications</strong>

            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={loading || unreadCount === 0}
              style={{
                border: 0,
                background: "transparent",
                color: unreadCount > 0 ? "#2563eb" : "#9ca3af",
                cursor: unreadCount > 0 ? "pointer" : "default",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Mark all read
            </button>
          </div>

          <div
            style={{
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    void handleNotificationClick(notification)
                  }
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: 0,
                    borderBottom: "1px solid #f3f4f6",
                    background: notification.read
                      ? "#ffffff"
                      : "#eff6ff",
                    padding: "13px 16px",
                    cursor: "pointer",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      borderRadius: 8,
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {getIcon(notification.type)}
                  </span>

                  <span
                    style={{
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: "#111827",
                        fontWeight: notification.read ? 400 : 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {notification.message}
                    </span>

                    {notification.taskTitle && (
                      <span
                        style={{
                          display: "block",
                          marginTop: 4,
                          color: "#6b7280",
                          fontSize: 12,
                        }}
                      >
                        {notification.taskTitle}
                      </span>
                    )}

                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        color: "#9ca3af",
                        fontSize: 11,
                      }}
                    >
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </span>
                  </span>

                  {!notification.read && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#2563eb",
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}