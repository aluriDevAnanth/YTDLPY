import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useAuthStore, type User } from "../../context/authStore";
import { CreateUserDialog, UserManagementTable } from "./admin";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export function AdminDialog() {
  const { isAdminOpen, setAdminOpen, user: currentUser } = useAuthStore();
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const handleCreateUser = async (
    username: string,
    password: string,
    role: "admin" | "user",
  ) => {
    setCreating(true);
    try {
      await axios.post(`${API_BASE}/api/admin/users`, {
        username,
        password,
        role,
      });
      toast.current?.show({
        severity: "success",
        summary: "User Created",
        detail: `User ${username} added successfully`,
      });
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
      style={{ width: "95vw", maxWidth: "900px" }}
      onHide={() => setAdminOpen(false)}
      dismissableMask
    >
      <Toast ref={toast} />

      <UserManagementTable
        users={users}
        loading={loading}
        currentUser={currentUser}
        onAddUserClick={() => setShowAddModal(true)}
        onDeleteUser={handleDeleteUser}
      />

      {showAddModal && (
        <CreateUserDialog
          visible={showAddModal}
          onHide={() => setShowAddModal(false)}
          onSubmit={handleCreateUser}
          loading={creating}
        />
      )}
    </Dialog>
  );
}

export default AdminDialog;
