import { Icon } from "@iconify/react";
import axios from "axios";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useAuthStore, type User } from "src/context/authStore";
import { socket } from "src/socket";
import { AdminMetricsOverview } from "./metrics";
import type { AdminStats } from "./adminTypes";
import { CreateUserDialog } from "./dialog";
import { UserManagementTable } from "./users";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export function AdminDashboard() {
  const { user: currentUser } = useAuthStore();
  const toast = useRef<Toast>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
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
        detail: `User '${username}' added successfully`,
      });
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
    <div className="w-full mx-auto p-0 sm:p-2 flex flex-col gap-2.5 sm:gap-6 font-sans">
      <Toast ref={toast} />
      {/* Dashboard Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 min-h-10">
        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Icon
            icon="tabler:layout-dashboard"
            className="text-cyan-600 dark:text-cyan-400 text-xl shrink-0"
          />
          <span className="truncate">System Analytics & Management</span>
        </span>
        <Button
          icon="pi pi-refresh"
          onClick={fetchDashboardData}
          loading={loading}
          className="size-9 p-button-sm shrink-0"
          tooltip="Refresh Analytics"
          tooltipOptions={{ position: "bottom" }}
        />
      </div>

      {/* Analytics Cards Grid */}
      <AdminMetricsOverview stats={stats} />

      {/* Accounts Table Container */}
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
    </div>
  );
}

export default AdminDashboard;
