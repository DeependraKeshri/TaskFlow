import { useEffect, useState } from "react";
import {
  createTaskComment,
  deleteTaskComment,
  getTaskComments,
  updateTaskComment,
  type TaskComment as TaskCommentType,
} from "../api/taskCommentApi";

type TaskCommentsProps = {
  taskId: string;
  currentUserId?: string;
  canComment?: boolean;
};

type CommentItemProps = {
  comment: TaskCommentType;
  taskId: string;
  currentUserId?: string;
  canComment: boolean;
  depth?: number;
  onChanged: () => Promise<void>;
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function CommentItem({
  comment,
  taskId,
  currentUserId,
  canComment,
  depth = 0,
  onChanged,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAuthor =
    Boolean(currentUserId) && currentUserId === comment.authorId;

  const handleReply = async () => {
    const content = replyText.trim();

    if (!content || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createTaskComment(taskId, {
        content,
        parentCommentId: comment.id,
      });

      setReplyText("");
      setReplying(false);
      await onChanged();
    } catch (err) {
      console.error(err);
      setError("Unable to add reply.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    const content = editText.trim();

    if (!content || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateTaskComment(taskId, comment.id, {
        content,
      });

      setEditing(false);
      await onChanged();
    } catch (err) {
      console.error(err);
      setError("Unable to update comment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (saving) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteTaskComment(taskId, comment.id);
      await onChanged();
    } catch (err) {
      console.error(err);
      setError("Unable to delete comment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        marginLeft: depth > 0 ? 32 : 0,
        marginTop: 12,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 14,
        background: depth > 0 ? "#fafafa" : "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div>
          <strong>{comment.authorName || comment.authorEmail}</strong>
          <div
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginTop: 2,
            }}
          >
            {formatDate(comment.createdAt)}
            {comment.updatedAt !== comment.createdAt ? " · edited" : ""}
          </div>
        </div>
      </div>

      {editing ? (
        <div>
          <textarea
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            rows={3}
            maxLength={10000}
            disabled={saving}
            style={{
              width: "100%",
              resize: "vertical",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving || !editText.trim()}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditText(comment.content);
                setError("");
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            lineHeight: 1.5,
          }}
        >
          {comment.content}
        </div>
      )}

      {error && (
        <div
          style={{
            color: "#dc2626",
            fontSize: 13,
            marginTop: 8,
          }}
        >
          {error}
        </div>
      )}

      {!editing && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          {canComment && (
            <button
              type="button"
              onClick={() => setReplying((value) => !value)}
              disabled={saving}
            >
              {replying ? "Cancel Reply" : "Reply"}
            </button>
          )}

          {isAuthor && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setEditText(comment.content);
                }}
                disabled={saving}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {replying && canComment && (
        <div style={{ marginTop: 12 }}>
          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Write a reply..."
            rows={3}
            maxLength={10000}
            disabled={saving}
            style={{
              width: "100%",
              resize: "vertical",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            onClick={handleReply}
            disabled={saving || !replyText.trim()}
            style={{ marginTop: 8 }}
          >
            {saving ? "Posting..." : "Post Reply"}
          </button>
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              taskId={taskId}
              currentUserId={currentUserId}
              canComment={canComment}
              depth={depth + 1}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskComments({
  taskId,
  currentUserId,
  canComment = false,
}: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskCommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadComments = async () => {
    setLoading(true);
    setError("");

    try {
      const page = await getTaskComments(taskId, 0, 50);
      setComments(page.content ?? []);
    } catch (err) {
      console.error(err);
      setError("Unable to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, [taskId]);

  const handleCreate = async () => {
    const content = newComment.trim();

    if (!content || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createTaskComment(taskId, {
        content,
      });

      setNewComment("");
      await loadComments();
    } catch (err) {
      console.error(err);
      setError("Unable to add comment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      style={{
        marginTop: 24,
        padding: 20,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Comments</h2>

        <button
          type="button"
          onClick={() => void loadComments()}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {canComment ? (
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Write a comment..."
            rows={4}
            maxLength={10000}
            disabled={saving}
            style={{
              width: "100%",
              resize: "vertical",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !newComment.trim()}
            style={{ marginTop: 8 }}
          >
            {saving ? "Posting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            background: "#f9fafb",
            color: "#6b7280",
          }}
        >
          You have view-only access to this task.
        </div>
      )}

      {error && (
        <div
          style={{
            color: "#dc2626",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{ color: "#6b7280" }}>
          No comments yet. Start the conversation.
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            taskId={taskId}
            currentUserId={currentUserId}
            canComment={canComment}
            onChanged={loadComments}
          />
        ))
      )}
    </section>
  );
}