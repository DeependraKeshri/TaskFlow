import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSharedWithMe, type TaskShare, type TaskSharePage } from "../api/taskShareApi";

const PAGE_SIZE = 10;

function permissionLabel(permission: TaskShare["permission"]): string {
  switch (permission) {
    case "VIEW": return "View";
    case "COMMENT": return "Comment";
    case "EDIT": return "Edit";
    case "FULL_ACCESS": return "Full Access";
    default: return permission;
  }
}

export default function SharedWithMePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<TaskSharePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  async function loadShares(currentPage: number) {
    try {
      setLoading(true);
      setError("");
      const result = await getSharedWithMe(currentPage, PAGE_SIZE);
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load shared tasks.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadShares(page);
  }, [page]);

  function openTask(share: TaskShare) {
    navigate("/tasks/" + share.taskId);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Shared With Me</h1>
          <p>Tasks that other users have shared with you.</p>
        </div>
      </div>

      {loading && (
        <div className="page-loading">Loading shared tasks...</div>
      )}

      {!loading && error && (
        <div className="page-error">
          <p>{error}</p>
          <button type="button" onClick={() => void loadShares(page)}>Retry</button>
        </div>
      )}

      {!loading && !error && data && data.content.length === 0 && (
        <div className="page-empty">
          <h2>No shared tasks</h2>
          <p>Tasks shared with you will appear here.</p>
        </div>
      )}

      {!loading && !error && data && data.content.length > 0 && (
        <>
          <div className="task-list">
            {data.content.map((share) => (
              <button
                type="button"
                className="task-card"
                key={share.id}
                onClick={() => openTask(share)}
              >
                <div className="task-card-content">
                  <div className="task-card-title">{share.taskTitle}</div>
                  <div className="task-card-meta">
                    <span>Shared by: {share.sharedByName || share.sharedByEmail || "Unknown user"}</span>
                    <span>Permission: {permissionLabel(share.permission)}</span>
                  </div>
                  {share.sharedByEmail && (
                    <div className="task-card-secondary">{share.sharedByEmail}</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="pagination">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </button>

            <span>Page {page + 1} of {Math.max(1, data.totalPages)}</span>

            <button
              type="button"
              disabled={page + 1 >= data.totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
