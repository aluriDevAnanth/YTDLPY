import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useAuthStore } from "src/context/authStore";
import useVideoStore from "src/context/videoStore";
import AdminDialog from "./AdminDialog";
import {
  AddDownloadButton,
  AddDownloadDialog,
  HeaderLogo,
  HeaderNavLinks,
  HeaderSearchBar,
  HeaderUserAvatar,
  MobileNavSidebar,
  PlaylistDropdown,
  ShortcutsHelpButton,
  UserProfileMenu,
  ViewModeToggle,
} from "./header/index";
import PlaylistManagerDialog from "./PlaylistManagerDialog";
import SettingsDialog from "./SettingsDialog";
import ShortcutsHelpDialog from "./ShortcutsHelpDialog";
import StorageManagerDialog from "./StorageManagerDialog";
import { ThemeInitializer } from "./ThemeSwitcher";

export function Header() {
  const {
    user,
    logout,
    setSettingsOpen,
    setStorageManagerOpen,
    isAddDownloadOpen,
    setAddDownloadOpen,
    setShortcutsHelpOpen,
  } = useAuthStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform?.toUpperCase().indexOf("MAC") >= 0;
  const viewMode = useVideoStore((state) => state.viewMode);
  const setViewMode = useVideoStore((state) => state.setViewMode);
  const globalFilter = useVideoStore((state) => state.globalFilter);
  const setGlobalFilter = useVideoStore((state) => state.setGlobalFilter);
  const profileMenuRef = useRef<any>(null);
  const playlistDropdownRef = useRef<any>(null);

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

  const handleToggleViewMode = () => {
    setViewMode(viewMode === "table" ? "grid" : "table");
  };

  return (
    <>
      <ThemeInitializer />
      <SettingsDialog />
      <PlaylistManagerDialog />
      <StorageManagerDialog />
      <ShortcutsHelpDialog />
      {user?.role === "admin" && <AdminDialog />}

      <MobileNavSidebar
        visible={mobileMenuOpen}
        onHide={() => setMobileMenuOpen(false)}
        user={user}
        currentPath={currentPath}
        customPlaylists={customPlaylists}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenStorageManager={() => setStorageManagerOpen(true)}
        onOpenShortcutsHelp={() => setShortcutsHelpOpen(true)}
        onLogout={logout}
      />

      <AddDownloadDialog
        visible={isAddDownloadOpen}
        onHide={() => setAddDownloadOpen(false)}
      />

      <PlaylistDropdown
        ref={playlistDropdownRef}
        currentPath={currentPath}
        customPlaylists={customPlaylists}
      />

      <UserProfileMenu
        ref={profileMenuRef}
        user={user}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenStorageManager={() => setStorageManagerOpen(true)}
        onOpenShortcutsHelp={() => setShortcutsHelpOpen(true)}
        onLogout={logout}
      />

      <header className="w-full bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-gray-800 shadow-xs py-1.5 sm:py-2 rounded-lg mb-1 font-sans transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 px-2">
          {/* Header Left / Top Row */}
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="sm:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-0 bg-transparent cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <span className="pi pi-bars text-xl" />
              </button>

              <HeaderLogo user={user} />
            </div>

            <HeaderNavLinks
              user={user}
              isPlaylistActive={isPlaylistActive}
              onOpenPlaylists={(e: React.MouseEvent) =>
                playlistDropdownRef.current?.toggle(e)
              }
            />

            {/* Mobile Actions Right Side */}
            <div className="flex items-center gap-1.5 shrink-0 sm:hidden">
              {user?.role !== "admin" && (
                <AddDownloadButton
                  onClick={() => setAddDownloadOpen(true)}
                  isMobile
                />
              )}

              <ViewModeToggle
                viewMode={viewMode}
                onToggleViewMode={handleToggleViewMode}
                isMobile
              />

              <HeaderUserAvatar
                user={user}
                onClick={(e: React.MouseEvent) =>
                  profileMenuRef.current?.toggle(e)
                }
                isMobile
              />
            </div>
          </div>

          {/* Center YouTube-style Search Input Bar */}
          <HeaderSearchBar
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            isMac={isMac}
          />

          {/* Desktop Right Side Controls */}
          <div className="hidden sm:flex items-center gap-2">
            {user?.role !== "admin" && (
              <>
                <AddDownloadButton
                  onClick={() => setAddDownloadOpen(true)}
                  isMac={isMac}
                />

                <ViewModeToggle
                  viewMode={viewMode}
                  onToggleViewMode={handleToggleViewMode}
                  isMac={isMac}
                />
              </>
            )}

            <ShortcutsHelpButton onClick={() => setShortcutsHelpOpen(true)} />

            <HeaderUserAvatar
              user={user}
              onClick={(e: React.MouseEvent) =>
                profileMenuRef.current?.toggle(e)
              }
            />
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
