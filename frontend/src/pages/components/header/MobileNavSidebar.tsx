import { Icon } from "@iconify/react";
import { Sidebar } from "primereact/sidebar";
import { memo } from "react";
import { Link } from "react-router";
import type { PlaylistT } from "src/schema";
import type { User } from "src/store/useAppStore";
import ThemeSwitcher from "../ThemeSwitcher";

interface MobileNavSidebarProps {
  visible: boolean;
  onHide: () => void;
  user: User | null;
  currentPath: string;
  customPlaylists: PlaylistT[];
  onOpenSettings: () => void;
  onOpenStorageManager: () => void;
  onOpenShortcutsHelp: () => void;
  onLogout: () => void;
}

export const MobileNavSidebar = memo(
  ({
    visible,
    onHide,
    user,
    currentPath,
    customPlaylists,
    onOpenSettings,
    onOpenStorageManager,
    onOpenShortcutsHelp,
    onLogout,
  }: MobileNavSidebarProps) => {
    return (
      <Sidebar
        visible={visible}
        onHide={onHide}
        position="left"
        className="dark:bg-[#18181b] dark:text-white font-sans w-72 p-0"
        header={
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
            <span className="text-cyan-500 font-black">YTDLPY</span>
            <span className="text-xs text-gray-400 font-normal">
              Navigation Menu
            </span>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          {/* User Details Box */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black text-xs flex items-center justify-center shadow-md uppercase shrink-0">
                {user?.username?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                  {user?.username}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role} Account
                </span>
              </div>
            </div>
            <ThemeSwitcher />
          </div>

          {/* Page Links List */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 my-1">
              Pages & Views
            </span>

            <Link
              to="/watch_later"
              onClick={onHide}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left no-underline ${
                currentPath === "/watch_later"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon icon="tabler:clock" className="text-lg text-amber-500" />
              <span>Watch Later</span>
            </Link>

            {/* Custom Playlists Subsection */}
            {customPlaylists.length > 0 && (
              <div className="flex flex-col gap-0.5 pl-4 border-l-2 border-gray-200 dark:border-gray-800 my-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase px-2 py-0.5">
                  Playlists ({customPlaylists.length})
                </span>
                {customPlaylists.map((pl) => {
                  const targetPath = `/${pl.public_id || pl.id}`;
                  return (
                    <Link
                      key={pl.id}
                      to={targetPath}
                      onClick={onHide}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-left no-underline ${
                        currentPath === targetPath
                          ? "text-cyan-600 dark:text-cyan-400 font-bold"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon
                        icon="tabler:playlist"
                        className="text-sm text-cyan-500"
                      />
                      <span className="truncate">{pl.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={onHide}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left no-underline ${
                  currentPath === "/admin"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon
                  icon="tabler:layout-dashboard"
                  className="text-lg text-purple-500"
                />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <Link
              to="/toast-studio"
              onClick={onHide}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left no-underline ${
                currentPath === "/toast-studio"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon
                icon="tabler:bell-ringing"
                className="text-lg text-amber-500"
              />
              <span>Toast Studio</span>
            </Link>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

          {/* Quick Actions */}
          <div className="flex flex-col gap-1">
            <Link
              to="/playlists"
              onClick={onHide}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left no-underline"
            >
              <Icon icon="tabler:playlist" className="text-lg text-cyan-500" />
              <span>Manage Playlists</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                onHide();
                onOpenSettings();
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border-0 cursor-pointer"
            >
              <Icon icon="tabler:settings" className="text-lg text-gray-400" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onHide();
                onOpenStorageManager();
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border-0 cursor-pointer"
            >
              <Icon
                icon="tabler:database"
                className="text-lg text-emerald-400"
              />
              <span>Storage Manager</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onHide();
                onOpenShortcutsHelp();
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border-0 cursor-pointer"
            >
              <Icon
                icon="tabler:keyboard"
                className="text-lg text-cyan-400"
              />
              <span>Keyboard Shortcuts (?)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onHide();
                onLogout();
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left border-0 cursor-pointer mt-2"
            >
              <Icon icon="tabler:logout" className="text-lg" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Sidebar>
    );
  },
);

MobileNavSidebar.displayName = "MobileNavSidebar";
