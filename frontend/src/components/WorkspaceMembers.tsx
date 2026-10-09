import { useEffect, useState, type FormEvent } from "react";

import {
  addWorkspaceMember,
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMember,
  type WorkspaceMember,
  type WorkspaceRole,
} from "../api/workspaceMemberApi";

interface WorkspaceMembersProps {
  workspaceId: string;
  currentUserId: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export default function WorkspaceMembers({
  workspaceId,
  currentUserId,
  isOwner,
  isAdmin,
}: WorkspaceMembersProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<WorkspaceRole, "OWNER">>("MEMBER");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canManageMembers = isOwner || isAdmin;

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");
      const data = await getWorkspaceMembers(workspaceId);
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load workspace members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!workspaceId) {
      setMembers([]);
      return;
    }
    void loadMembers();
  }, [workspaceId]);

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    try {
      setSaving(true);
      setError("");
      const newMember = await addWorkspaceMember(workspaceId, {
        email: email.trim(),
        role,
      });
      setMembers((current) => [...current, newMember]);
      setEmail("");
      setRole("MEMBER");
    } catch (err) {
      console.error(err);
      setError("Unable to add workspace member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(member: WorkspaceMember, newRole: Exclude<WorkspaceRole, "OWNER">) {
    try {
      setError("");
      const updatedMember = await updateWorkspaceMember(workspaceId, member.id, { role: newRole });
      setMembers((current) => current.map((item) => item.id === member.id ? updatedMember : item));
    } catch (err) {
      console.error(err);
      setError("Unable to update member role.");
    }
  }

  async function handleRemoveMember(member: WorkspaceMember) {
    if (member.userId === currentUserId) {
      setError("You cannot remove yourself.");
      return;
    }
    if (member.role === "OWNER") {
      setError("The workspace owner cannot be removed.");
      return;
    }
    if (!window.confirm(`Remove ${member.userName} from this workspace?`)) return;

    try {
      setError("");
      await removeWorkspaceMember(workspaceId, member.id);
      setMembers((current) => current.filter((item) => item.id !== member.id));
    } catch (err) {
      console.error(err);
      setError("Unable to remove workspace member.");
    }
  }

  return (
    <div className="workspace-members">
      {error && (
        <div className="error-message">
          {error}
          <button type="button" onClick={() => setError("")}>×</button>
        </div>
      )}

      {canManageMembers && (
        <form className="task-form" onSubmit={handleAddMember}>
          <h3>Add Workspace Member</h3>
          <div className="task-form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter user email" required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(event) => setRole(event.target.value as Exclude<WorkspaceRole, "OWNER">)}>
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
                {isOwner && <option value="ADMIN">Admin</option>}
              </select>
            </div>
          </div>
          <div className="task-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Adding..." : "Add Member"}</button>
          </div>
        </form>
      )}

      <div className="workspace-list">
        {loading ? (
          <div className="empty-state"><p>Loading members...</p></div>
        ) : members.length === 0 ? (
          <div className="empty-state"><h3>No members</h3><p>This workspace has no members.</p></div>
        ) : (
          members.map((member) => (
            <div className="workspace-card" key={member.id}>
              <div className="workspace-card-main">
                <h3>{member.userName}</h3>
                <p>{member.userEmail}</p>
                <p><strong>Role:</strong> {member.role}</p>
              </div>
              {canManageMembers && member.role !== "OWNER" && (
                <div className="workspace-card-actions">
                  <select value={member.role} onChange={(event) => handleRoleChange(member, event.target.value as Exclude<WorkspaceRole, "OWNER">)}>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                    {isOwner && <option value="ADMIN">Admin</option>}
                  </select>
                  <button type="button" className="task-action-button delete" onClick={() => handleRemoveMember(member)}>Remove</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
