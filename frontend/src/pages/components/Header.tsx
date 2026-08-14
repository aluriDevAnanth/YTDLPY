import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import { Sidebar } from "primereact/sidebar";
import { Tag } from "primereact/tag";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { useAuthStore } from "src/context/authStore";
import useVideoStore from "src/context/videoStore";
import AdminDialog from "./AdminDialog";
import DownloadForm from "./DownloadForm";
import PlaylistManagerDialog from "./PlaylistManagerDialog";
import SettingsDialog from "./SettingsDialog";
import StorageManagerDialog from "./StorageManagerDialog";
import ThemeSwitcher, { ThemeInitializer } from "./ThemeSwitcher";

function Header() {
  const { user, logout, setSettingsOpen, setStorageManagerOpen } =
    useAuthStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const [visible, setVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const viewMode = useVideoStore((state) => state.viewMode);
  const setViewMode = useVideoStore((state) => state.setViewMode);
  const globalFilter = useVideoStore((state) => state.globalFilter);
  const setGlobalFilter = useVideoStore((state) => state.setGlobalFilter);
  const profileMenuRef = useRef<OverlayPanel>(null);
  const playlistDropdownRef = useRef<OverlayPanel>(null);

  const playlists = useVideoStore((state) => state.playlists);
  const fetchPlaylists = useVideoStore((state) => state.fetchPlaylists);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user, fetchPlaylists]);

  const customPlaylists = playlists.filter((p) => !p.is_default);

  const isPlaylistActive =
    currentPath === "/watch_later" ||
    customPlaylists.some((p) => currentPath === `/${p.public_id || p.id}`);

  return (
    <>
      <ThemeInitializer />
      <SettingsDialog />
      <PlaylistManagerDialog />
      <StorageManagerDialog />
      {user?.role === "admin" && <AdminDialog />}

      {/* Mobile-First Navigation Menu Drawer */}
      <Sidebar
        visible={mobileMenuOpen}
        onHide={() => setMobileMenuOpen(false)}
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
              onClick={() => setMobileMenuOpen(false)}
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
                      onClick={() => setMobileMenuOpen(false)}
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
                onClick={() => setMobileMenuOpen(false)}
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
              onClick={() => setMobileMenuOpen(false)}
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
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left no-underline"
            >
              <Icon icon="tabler:playlist" className="text-lg text-cyan-500" />
              <span>Manage Playlists</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSettingsOpen(true);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border-0 cursor-pointer"
            >
              <Icon icon="tabler:settings" className="text-lg text-gray-400" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setStorageManagerOpen(true);
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
                setMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left border-0 cursor-pointer mt-2"
            >
              <Icon icon="tabler:logout" className="text-lg" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Sidebar>

      {/* Add Download Modal */}
      <Dialog
        visible={visible}
        style={{ width: "90vw" }}
        onHide={() => setVisible(false)}
        dismissableMask
        showHeader={false}
        pt={{ content: { className: "p-2 sm:pt-3 sm:p-2" } }}
        position="top"
      >
        <DownloadForm />
      </Dialog>

      {/* Desktop Playlists Dropdown Menu */}
      <OverlayPanel
        ref={playlistDropdownRef}
        dismissable
        className="dark:bg-[#18181b] dark:text-white dark:border-gray-800 rounded-xl shadow-2xl p-0 w-60 border border-gray-200"
      >
        <div className="flex flex-col p-1 gap-0.5 text-xs font-sans">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1">
            Your Playlists
          </span>

          <Link
            to="/watch_later"
            onClick={() => playlistDropdownRef.current?.hide()}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors no-underline ${
              currentPath === "/watch_later"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Icon icon="tabler:clock" className="text-base text-amber-500" />
            <span className="font-semibold">Watch Later</span>
          </Link>

          {customPlaylists.map((pl) => {
            const targetPath = `/${pl.public_id || pl.id}`;
            return (
              <Link
                key={pl.id}
                to={targetPath}
                onClick={() => playlistDropdownRef.current?.hide()}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors no-underline ${
                  currentPath === targetPath
                    ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon
                  icon="tabler:playlist"
                  className="text-base text-cyan-500"
                />
                <span className="truncate">{pl.name}</span>
              </Link>
            );
          })}

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

          <Link
            to="/playlists"
            onClick={() => playlistDropdownRef.current?.hide()}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-500 text-left font-medium no-underline"
          >
            <Icon icon="tabler:plus" className="text-base" />
            <span>Manage All Playlists...</span>
          </Link>
        </div>
      </OverlayPanel>

      {/* User Profile Popup Menu */}
      <OverlayPanel
        pt={{ content: { className: "px-2 py-1" } }}
        ref={profileMenuRef}
        dismissable
        className="dark:bg-[#18181b] dark:text-white dark:border-gray-800 rounded-xl shadow-2xl p-0 w-64 border border-gray-200"
      >
        <div className="flex flex-col">
          {/* User Details Header */}
          <div className="flex justify-between gap-3 p-2 border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900/50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black text-base flex items-center justify-center shadow-md uppercase shrink-0">
                {user?.username?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {user?.username}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role} Account
                </span>
              </div>
            </div>
            <div className="my-auto">
              <ThemeSwitcher />
            </div>
          </div>

          {/* Menu Action List */}
          <div className="flex flex-col p-1 gap-0.5">
            <Link
              to="/toast-studio"
              onClick={() => profileMenuRef.current?.hide()}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-200 w-full text-left font-medium no-underline hover:font-bold dark:hover:text-gray-400"
            >
              <Icon
                icon="tabler:bell-ringing"
                className="text-lg text-amber-500 shrink-0"
              />
              <span>Toast Notification Studio</span>
            </Link>

            <Link
              to="/playlists"
              onClick={() => profileMenuRef.current?.hide()}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-200 w-full text-left font-medium no-underline hover:font-bold dark:hover:text-gray-400"
            >
              <Icon
                icon="tabler:playlist"
                className="text-lg text-cyan-400 shrink-0"
              />
              <span>Playlist Management Studio</span>
            </Link>

            <div
              onClick={() => {
                profileMenuRef.current?.hide();
                setSettingsOpen(true);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-200 w-full text-left font-medium cursor-pointer border-0 hover:font-bold dark:hover:text-gray-400"
            >
              <Icon
                icon="tabler:settings"
                className="text-lg text-gray-400 shrink-0"
              />
              <span>Settings & Preferences</span>
            </div>

            <div
              onClick={() => {
                profileMenuRef.current?.hide();
                setStorageManagerOpen(true);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-200 w-full text-left font-medium cursor-pointer border-0 hover:font-bold dark:hover:text-gray-400"
            >
              <Icon
                icon="tabler:database"
                className="text-lg text-emerald-400 shrink-0"
              />
              <span>Storage Manager</span>
            </div>

            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => profileMenuRef.current?.hide()}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-200 w-full text-left font-medium no-underline hover:font-bold dark:hover:text-gray-400"
              >
                <Icon
                  icon="tabler:shield"
                  className="text-lg text-purple-400 shrink-0"
                />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

            <div
              onClick={() => {
                profileMenuRef.current?.hide();
                logout();
              }}
              className="flex items-center gap-3 px-3 py-1 text-sm rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors w-full text-left font-semibold cursor-pointer border-0"
            >
              <Icon icon="tabler:logout" className="text-lg shrink-0" />
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      </OverlayPanel>

      <header className="w-full bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-gray-800 shadow-xs py-1.5 sm:py-2 rounded-lg mb-1 font-sans transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 px-2">
          {/* Mobile First Header Top Row */}
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0">
              {/* Mobile Menu Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="sm:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-0 bg-transparent cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Icon icon="tabler:menu-2" className="text-xl" />
              </button>

              <Link
                to="/"
                className="font-bold text-base sm:text-xl text-gray-900 dark:text-white truncate shrink-0 hover:text-cyan-500 transition-colors no-underline"
              >
                YTDLPY
              </Link>
              {user?.role === "admin" && (
                <Tag
                  value="ADMIN"
                  severity="danger"
                  className="text-white text-[9px] sm:text-[10px] font-mono tracking-wider px-1 py-0.5"
                />
              )}
            </div>

            {/* Desktop Inline Text Page Links */}
            <div className="hidden sm:flex items-center gap-5 ml-4">
              <NavLink
                to="/watch_later"
                className={({ isActive }) =>
                  `text-xs sm:text-sm font-semibold transition-colors no-underline ${
                    isActive
                      ? "text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500 pb-0.5"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                Watch Later
              </NavLink>

              <button
                type="button"
                onClick={(e) => playlistDropdownRef.current?.toggle(e)}
                className={`text-xs sm:text-sm font-semibold transition-colors border-0 bg-transparent cursor-pointer flex items-center gap-1 ${
                  isPlaylistActive
                    ? "text-cyan-600 dark:text-cyan-400 font-bold border-b-2 border-cyan-500 pb-0.5"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>Playlists</span>
                <Icon icon="tabler:chevron-down" className="text-xs" />
              </button>

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `text-xs sm:text-sm font-semibold transition-colors no-underline ${
                      isActive
                        ? "text-purple-600 dark:text-purple-400 font-bold border-b-2 border-purple-500 pb-0.5"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}

              <NavLink
                to="/toast-studio"
                className={({ isActive }) =>
                  `text-xs sm:text-sm font-semibold transition-colors no-underline ${
                    isActive
                      ? "text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500 pb-0.5"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                Toast Studio
              </NavLink>
            </div>

            {/* Mobile Actions Right Side (Add Video, View Toggle, Profile Avatar) */}
            <div className="flex items-center gap-1.5 shrink-0 sm:hidden">
              {user?.role !== "admin" && (
                <Button
                  onClick={() => setVisible(true)}
                  severity="success"
                  aria-label="Add Download"
                  tooltip="Add Video"
                  className="p-button-sm !p-1 text-xs"
                >
                  <Icon icon="tabler:plus" className="text-base" />
                </Button>
              )}

              <Button
                onClick={() =>
                  setViewMode(viewMode === "table" ? "grid" : "table")
                }
                severity="info"
                outlined
                aria-label="Toggle View Mode"
                className="p-button-sm !p-1"
              >
                <Icon
                  icon={
                    viewMode === "table" ? "tabler:layout-grid" : "tabler:table"
                  }
                  className="text-base"
                />
              </Button>

              {/* Profile Avatar Button on Mobile */}
              <button
                type="button"
                onClick={(e) => profileMenuRef.current?.toggle(e)}
                className="size-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black text-xs flex items-center justify-center shadow-md uppercase cursor-pointer border-0 ring-2 ring-cyan-500/30"
              >
                {user?.username?.charAt(0) || "U"}
              </button>
            </div>
          </div>

          {/* Center YouTube-style Search Input Bar */}
          <div className="relative flex-1 max-w-full sm:max-w-md w-full flex items-center mx-1 sm:mx-4 my-1 sm:my-0">
            <Icon
              icon="tabler:search"
              className="absolute left-3 text-gray-400 dark:text-gray-500 text-base pointer-events-none"
            />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search videos by title, URL, resolution..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 focus:border-cyan-500 rounded-xl transition-all"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter("")}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs cursor-pointer border-0 bg-transparent"
                title="Clear Search"
              >
                <Icon icon="tabler:x" className="text-base" />
              </button>
            )}
          </div>

          {/* Desktop Right Side Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user?.role !== "admin" && (
              <>
                <Button
                  onClick={() => setVisible(true)}
                  severity="success"
                  className="p-button-sm p-1.5"
                  tooltip="Add Download"
                  tooltipOptions={{ position: "bottom" }}
                >
                  <Icon icon="tabler:plus" className="text-lg" />
                </Button>

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
              </>
            )}

            {/* Profile Avatar Button on Desktop */}
            <button
              type="button"
              onClick={(e) => profileMenuRef.current?.toggle(e)}
              className="size-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black text-sm flex items-center justify-center shadow-md uppercase cursor-pointer border-0 hover:ring-2 hover:ring-cyan-400 hover:scale-105 transition-all ml-1"
              title={`${user?.username} (${user?.role})`}
            >
              {user?.username?.charAt(0) || "U"}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
export default Header;
