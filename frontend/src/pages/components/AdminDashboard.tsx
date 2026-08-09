import { Icon } from "@iconify/react";
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
import { socket } from "../../socket";
const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
interface AdminStats {
  total_users: number;
  total_videos: number;
  completed_downloads: number;
  total_storage_bytes: number;
  formatted_storage: string;
}
const roleOptions = [
  { label: "User", value: "user" },
  { label: "Administrator", value: "admin" },
];
export default function AdminDashboard() {
  const { user: currentUser } = useAuthStore();
  const toast = useRef<Toast>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [creating, setCreating] = useState<boolean>(false);
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get<AdminStats>(`${API_BASE}/api/admin/stats`),
        axios.get<User[]>(`${API_BASE}/api/admin/users`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load system analytics",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
    const handleVideoUpdate = (data: any) => {
      if (data.downloadStatus === "completed" || data.percent === 100) {
        fetchDashboardData();
      }
    };
    socket.on("admin_stats_update", fetchDashboardData);
    socket.on("video_update", handleVideoUpdate);
    socket.on("remove_video", fetchDashboardData);
    return () => {
      socket.off("admin_stats_update", fetchDashboardData);
      socket.off("video_update", handleVideoUpdate);
      socket.off("remove_video", fetchDashboardData);
    };
  }, []);
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
        detail: `User '${newUsername}' added successfully`,
      });
      setNewUsername("");
      setNewPassword("");
      setShowAddModal(false);
      fetchDashboardData();
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
        `Delete user '${targetUser.username}'? All associated video bundles will be permanently deleted.`,
      )
    ) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/api/admin/users/${targetUser.id}`);
      toast.current?.show({
        severity: "success",
        summary: "User Purged",
        detail: `Purged user '${targetUser.username}'`,
      });
      fetchDashboardData();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.detail || "Failed to delete user",
      });
    }
  };
  return (
    <div className="w-full mx-auto p-2 flex flex-col gap-6 font-sans">
      <Toast ref={toast} />
      {}
      <div className="flex gap-3 items-center h-10">
        <span className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <Icon
            icon="tabler:layout-dashboard"
            className="text-cyan-400 text-xl"
          />
          <span>System Analytics & Management</span>
        </span>
        <Button
          icon="pi pi-refresh"
          onClick={fetchDashboardData}
          loading={loading}
          className="size-9"
          tooltip="Refresh Analytics"
          tooltipOptions={{ position: "bottom" }}
        />
      </div>
      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {}
        <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Users
            </span>
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {(stats?.total_users ?? 0) - 1}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Icon icon="tabler:users" className="text-xl" />
          </div>
        </div>
        {}
        <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Videos
            </span>
            <span className="text-2xl font-bold font-mono text-indigo-400">
              {stats?.total_videos ?? 0}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Icon icon="tabler:video" className="text-xl" />
          </div>
        </div>
        {}
        <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Disk Usage
            </span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              {stats?.formatted_storage ?? "0 MiB"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Icon icon="tabler:database" className="text-xl" />
          </div>
        </div>
        {}
        <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Completed
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {stats?.completed_downloads ?? 0}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Icon icon="tabler:circle-check" className="text-xl" />
          </div>
        </div>
      </div>
      {}
      <div className="flex flex-col gap-3 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
        <div className="flex justify-between items-center px-1">
          <span className="text-sm font-bold text-gray-200">User Accounts</span>
          <Button
            label="Add User"
            icon="pi pi-user-plus"
            severity="success"
            size="small"
            onClick={() => setShowAddModal(true)}
          />
        </div>
        <DataTable
          value={users}
          loading={loading}
          stripedRows
          size="small"
          className="text-xs rounded-lg overflow-hidden border border-gray-700/40"
        >
          <Column
            field="username"
            header="Username"
            sortable
            className="font-medium"
          />
          <Column
            field="role"
            header="Role"
            body={(row: User) => (
              <Tag
                value={row.role.toUpperCase()}
                severity={row.role === "admin" ? "danger" : "info"}
                className="text-[10px] font-mono font-bold"
              />
            )}
          />
          <Column
            field="created_at"
            header="Joined"
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
                tooltip={
                  row.id === currentUser?.id
                    ? "Cannot delete own admin account"
                    : "Delete user"
                }
              />
            )}
          />
        </DataTable>
      </div>
      {}
      {showAddModal && (
        <Dialog
          header="Create User Account"
          visible={showAddModal}
          onHide={() => setShowAddModal(false)}
          style={{ width: "380px" }}
          dismissableMask
        >
          <form
            onSubmit={handleCreateUser}
            className="flex flex-col gap-3 py-1 font-sans"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-300">
                Username
              </label>
              <InputText
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                placeholder="Enter username..."
                className="p-inputtext-sm w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-300">
                Password
              </label>
              <InputText
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter password..."
                className="p-inputtext-sm w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-300">
                Role
              </label>
              <Dropdown
                value={newRole}
                options={roleOptions}
                onChange={(e) => setNewRole(e.value)}
                className="w-full p-inputtext-sm"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-700/50">
              <Button
                label="Cancel"
                severity="secondary"
                size="small"
                onClick={() => setShowAddModal(false)}
              />
              <Button
                label="Create"
                icon="pi pi-check"
                severity="success"
                size="small"
                loading={creating}
                type="submit"
              />
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
