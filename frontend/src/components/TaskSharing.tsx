import { useEffect, useState } from "react";
import { createTaskShare, getTaskShares, revokeTaskShare, type TaskShare, type TaskSharePermission } from "../api/taskShareApi";
import { searchUsers, type UserSearchResult } from "../api/userApi";

interface TaskSharingProps {
  taskId: string;
  canManageSharing: boolean;
}

const permissions: TaskSharePermission[] = [
  "VIEW",
  "COMMENT",
  "EDIT",
  "FULL_ACCESS",
];

function permissionLabel(permission: TaskSharePermission): string {
  switch (permission) {
    case "VIEW":
      return "View";
    case "COMMENT":
      return "Comment";
    case "EDIT":
      return "Edit";
    case "FULL_ACCESS":
      return "Full Access";
    default:
      return permission;
  }
}

export default function TaskSharing({
  taskId,
  canManageSharing,
}: TaskSharingProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permission, setPermission] = useState<TaskSharePermission>("VIEW");
  const [shares, setShares] = useState<TaskShare[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingShares, setLoadingShares] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [removingShareId, setRemovingShareId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadShares() {
    setLoadingShares(true);
    setError("");

    try {
      const result = await getTaskShares(taskId, 0, 20);
      setShares(result.content);
    } catch (err) {
      console.error(err);
      setError("Unable to load task shares.");
    } finally {
      setLoadingShares(false);
    }
  }

  useEffect(() => {
    void loadShares();
  }, [taskId]);

  async function handleSearch() {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    setError("");

    try {
      const results = await searchUsers(normalizedQuery);
      setUsers(results);
    } catch (err) {
      console.error(err);
      setUsers([]);
      setError("Unable to search users.");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleShare() {
    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }

    setSharing(true);
    setError("");
    setSuccess("");

    try {
      const createdShare = await createTaskShare(taskId, {
        userId: selectedUserId,
        permission,
      });

      setShares((current) => [createdShare, ...current]);
      setSelectedUserId("");
      setQuery("");
      setUsers([]);
      setSuccess("Task shared successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to share this task.");
    } finally {
      setSharing(false);
    }
  }

  async function handleRevoke(shareId: string) {
    setRemovingShareId(shareId);
    setError("");
    setSuccess("");

    try {
      await revokeTaskShare(taskId, shareId);
      setShares((current) => current.filter((share) => share.id !== shareId));
      setSuccess("Task sharing revoked.");
    } catch (err) {
      console.error(err);
      setError("Unable to revoke task sharing.");
    } finally {
      setRemovingShareId("");
    }
  }

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <h2>Task Sharing</h2>
          <p>Share this task with other TaskFlow users.</p>
        </div>
      </div>

      {!canManageSharing && (
        <p>Only the task owner can manage sharing.</p>
      )}

      {canManageSharing && (
        <div>
          <div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email"
            />
            <button
              type="button"
              onClick={() => void handleSearch()}
              disabled={loadingUsers || query.trim().length < 2}
            >
              {loadingUsers ? "Searching..." : "Search"}
            </button>
          </div>

          {users.length > 0 && (
            <div>
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <strong>{user.name}</strong>
                  <span> {user.email}</span>
                  {selectedUserId === user.id && <span> ?</span>}
                </button>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="task-share-permission">Permission</label>
            <select
              id="task-share-permission"
              value={permission}
              onChange={(event) => setPermission(event.target.value as TaskSharePermission)}
            >
              {permissions.map((value) => (
                <option key={value} value={value}>
                  {permissionLabel(value)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => void handleShare()}
              disabled={sharing || !selectedUserId}
            >
              {sharing ? "Sharing..." : "Share Task"}
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert">{error}</p>}
      {success && <p>{success}</p>}

      <div>
        <h3>People with access</h3>

        {loadingShares ? (
          <p>Loading shares...</p>
        ) : shares.length === 0 ? (
          <p>This task is not shared with anyone.</p>
        ) : (
          <div>
            {shares.map((share) => (
              <div key={share.id}>
                <div>
                  <strong>{share.sharedWithName}</strong>
                  <span> {share.sharedWithEmail}</span>
                </div>
                <div>
                  <span>{permissionLabel(share.permission)}</span>
                  {canManageSharing && (
                    <button
                      type="button"
                      onClick={() => void handleRevoke(share.id)}
                      disabled={removingShareId === share.id}
                    >
                      {removingShareId === share.id ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
