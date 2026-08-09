import axios from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useAuthStore, type User } from "../../context/authStore";
const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const roleOptions = [
  { label: "User", value: "user" },
  { label: "Administrator", value: "admin" },
];
export default function AdminDialog() {
  const { isAdminOpen, setAdminOpen, user: currentUser } = useAuthStore();
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [creating, setCreating] = useState(false);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch user list",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isAdminOpen) {
      fetchUsers();
    }
  }, [isAdminOpen]);
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API_BASE}/api/admin/users`, {
        username: newUsername,
        password: newPassword,
        role: newRole,
      });
      toast.current?.show({
        severity: "success",
        summary: "User Created",
        detail: `User ${newUsername} added successfully`,
      });
      setNewUsername("");
      setNewPassword("");
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.detail || "Failed to create user",
      });
    } finally {
      setCreating(false);
    }
  };
  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      toast.current?.show({
        severity: "warn",
        summary: "Forbidden",
        detail: "Cannot delete your own admin account",
      });
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete user ${targetUser.username}? All their downloaded videos and bundle files will be permanently purged!`,
      )
    ) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/api/admin/users/${targetUser.id}`);
      toast.current?.show({
        severity: "success",
        summary: "User Deleted",
        detail: `Purged user ${targetUser.username} and all bundle files`,
      });
      fetchUsers();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.detail || "Failed to delete user",
      });
    }
  };
  return (
    <Dialog
      header="System User Administration"
      visible={isAdminOpen}
      style={{ width: "70vw" }}
      onHide={() => setAdminOpen(false)}
      dismissableMask
    >
      <Toast ref={toast} />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">User Accounts & RBAC Roles</h3>
        <Button
          label="Add User"
          icon="pi pi-user-plus"
          severity="success"
          onClick={() => setShowAddModal(true)}
        />
      </div>
      <DataTable
        value={users}
        loading={loading}
        stripedRows
        size="small"
        showGridlines
      >
        <Column field="username" header="Username" sortable />
        <Column
          field="role"
          header="Role"
          body={(row: User) => (
            <Tag
              value={row.role.toUpperCase()}
              severity={row.role === "admin" ? "danger" : "info"}
            />
          )}
        />
        <Column
          field="created_at"
          header="Created At"
          body={(row: User) => new Date(row.created_at).toLocaleDateString()}
        />
        <Column
          header="Actions"
          body={(row: User) => (
            <Button
              icon="pi pi-trash"
              severity="danger"
              outlined
              className="p-button-sm py-1 px-2"
              disabled={row.id === currentUser?.id}
              onClick={() => handleDeleteUser(row)}
            />
          )}
        />
      </DataTable>
      {}
      {showAddModal && (
        <Dialog
          header="Create User Account"
          visible={showAddModal}
          onHide={() => setShowAddModal(false)}
          style={{ width: "400px" }}
          dismissableMask
        >
          <form
            onSubmit={handleCreateUser}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Username</label>
              <InputText
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Password</label>
              <InputText
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Role</label>
              <Dropdown
                value={newRole}
                options={roleOptions}
                onChange={(e) => setNewRole(e.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button
                label="Cancel"
                severity="secondary"
                onClick={() => setShowAddModal(false)}
              />
              <Button
                label="Create"
                icon="pi pi-check"
                loading={creating}
                type="submit"
              />
            </div>
          </form>
        </Dialog>
      )}
    </Dialog>
  );
}
