import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useState } from "react";

import { useAuthStore } from "src/context/authStore";
import useVideoStore from "src/context/videoStore";
import AdminDialog from "./AdminDialog";
import DownloadForm from "./DownloadForm";
import SettingsDialog from "./SettingsDialog";
import ThemeSwitcher from "./ThemeSwitcher";

interface HeaderProps {
  onRestart?: () => void;
  isRestarting?: boolean;
}

function Header({ onRestart, isRestarting }: HeaderProps) {
  const { user, logout, setSettingsOpen, setAdminOpen } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const viewMode = useVideoStore((state) => state.viewMode);
  const setViewMode = useVideoStore((state) => state.setViewMode);
  const globalFilter = useVideoStore((state) => state.globalFilter);

  return (
    <>
      <SettingsDialog />
      {user?.role === "admin" && <AdminDialog />}
      <Dialog
        visible={visible}
        style={{ width: "90vw" }}
        onHide={() => {
          setVisible(false);
        }}
        dismissableMask
        showHeader={false}
        pt={{ content: { className: "p-2 sm:pt-3 sm:p-2" } }}
        position="top"
      >
        <DownloadForm />
      </Dialog>

      <header className="w-full bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-gray-800 shadow-xs py-1.5 sm:py-1.5 rounded-lg mb-1 font-sans transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          {/* Top Bar on Mobile / Left Side on Desktop */}
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            {/* Brand & User Role Badge */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-base sm:text-2xl text-gray-900 dark:text-white truncate shrink-0 pl-10">
                YTDLPY
              </span>
              {user?.role === "admin" && (
                <Tag
                  value="ADMIN"
                  severity="danger"
                  className="text-white text-[9px] sm:text-[10px] font-mono tracking-wider px-1 py-0.5"
                />
              )}
            </div>

            {/* Compact Action Icons Row for Mobile (Top-Right) */}
            <div className="flex items-center gap-1 shrink-0 sm:hidden">
              {user?.role !== "admin" && (
                <>
                  <Button
                    onClick={() => setVisible(true)}
                    severity="success"
                    aria-label="Add Download"
                    tooltip="Add Video"
                    className="p-button-sm !p-1 text-xs"
                  >
                    <Icon icon="tabler:plus" className="text-base" />
                  </Button>

                  <Button
                    onClick={() =>
                      setViewMode(viewMode === "table" ? "grid" : "table")
                    }
                    severity="info"
                    outlined
                    aria-label="Toggle View Mode"
                    tooltip={
                      viewMode === "table"
                        ? "Switch to YouTube Grid"
                        : "Switch to Table View"
                    }
                    className="p-button-sm !p-1"
                  >
                    <Icon
                      icon={
                        viewMode === "table"
                          ? "tabler:layout-grid"
                          : "tabler:table"
                      }
                      className="text-base"
                    />
                  </Button>
                </>
              )}

              {user?.role === "admin" && (
                <Button
                  onClick={() => setAdminOpen(true)}
                  severity="help"
                  outlined
                  className="p-button-sm !p-1"
                  tooltip="Admin Management"
                >
                  <Icon icon="tabler:shield" className="text-base" />
                </Button>
              )}

              <Button
                onClick={() => setSettingsOpen(true)}
                severity="secondary"
                outlined
                className="p-button-sm !p-1"
                tooltip="Settings"
              >
                <Icon icon="tabler:settings" className="text-base" />
              </Button>

              <Button
                onClick={onRestart}
                disabled={isRestarting}
                severity="danger"
                outlined
                className="p-button-sm !p-1"
                tooltip="Restart Backend"
              >
                <Icon icon="tabler:refresh" className="text-base" />
              </Button>

              <ThemeSwitcher />

              <Button
                onClick={logout}
                severity="warning"
                outlined
                className="p-button-sm !p-1"
                tooltip="Logout"
              >
                <Icon icon="tabler:logout" className="text-base" />
              </Button>
            </div>
          </div>

          {/* Search Input (Full width on mobile row 2, inline on desktop) */}
          {user?.role !== "admin" && (
            <div className="flex items-center gap-2 w-full sm:w-auto grow max-w-full sm:max-w-md">
              <InputText
                value={globalFilter}
                onChange={(e) =>
                  useVideoStore.setState(() => ({
                    globalFilter: e.target.value,
                  }))
                }
                placeholder="Search videos..."
                className="p-inputtext-sm w-full py-1 text-xs sm:text-sm sm:w-56 md:w-64"
              />
              <Button
                onClick={() => setVisible(true)}
                severity="success"
                aria-label="Add Download"
                tooltip="Add Video Download"
                className="p-1 shrink-0 hidden sm:inline-flex"
              >
                <Icon icon="tabler:plus" className="text-lg" />
              </Button>
            </div>
          )}

          {/* Full Desktop Actions Toolbar */}
          <div className="hidden sm:flex items-center justify-end gap-1.5 shrink-0">
            {user && (
              <div className="flex items-center gap-1.5 px-2 py-1 border border-gray-300 dark:border-gray-700/60 rounded-md bg-gray-100 dark:bg-gray-900/40 text-md">
                <Icon icon="tabler:user" className="text-md text-gray-500 dark:text-gray-400" />
                {user.role !== "admin" && (
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[90px] text-xs">
                    {user.username}
                  </span>
                )}
                <Tag
                  value={user.role.toUpperCase()}
                  severity={user.role === "admin" ? "danger" : "info"}
                  className="text-[10px] py-1 px-1 font-extrabold"
                />
              </div>
            )}

            {user?.role !== "admin" && (
              <Button
                onClick={() =>
                  setViewMode(viewMode === "table" ? "grid" : "table")
                }
                severity="info"
                outlined
                className="p-button-sm p-1.5"
                tooltip={
                  viewMode === "table"
                    ? "Switch to YouTube Grid View"
                    : "Switch to Table View"
                }
                tooltipOptions={{ position: "bottom" }}
              >
                <Icon
                  icon={
                    viewMode === "table"
                      ? "tabler:layout-grid"
                      : "tabler:table"
                  }
                  className="text-lg"
                />
              </Button>
            )}

            {user?.role === "admin" && (
              <Button
                onClick={() => setAdminOpen(true)}
                severity="help"
                outlined
                className="p-button-sm p-1.5"
                tooltip="Admin User Management"
                tooltipOptions={{ position: "bottom" }}
              >
                <Icon icon="tabler:shield" className="text-lg" />
              </Button>
            )}

            <Button
              onClick={() => setSettingsOpen(true)}
              severity="secondary"
              outlined
              className="p-button-sm p-1.5"
              tooltip="User Preferences & Settings"
              tooltipOptions={{ position: "bottom" }}
            >
              <Icon icon="tabler:settings" className="text-lg" />
            </Button>

            <Button
              onClick={onRestart}
              disabled={isRestarting}
              severity="danger"
              outlined
              className="p-button-sm p-1.5"
              tooltip="Restart Backend Server"
              tooltipOptions={{ position: "bottom" }}
            >
              <Icon icon="tabler:refresh" className="text-lg" />
            </Button>

            <ThemeSwitcher />

            <Button
              onClick={logout}
              severity="warning"
              outlined
              className="p-button-sm p-1.5"
              tooltip="Logout"
              tooltipOptions={{ position: "bottom" }}
            >
              <Icon icon="tabler:logout" className="text-lg" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
export default Header;
