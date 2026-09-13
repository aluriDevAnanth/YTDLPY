import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppStore } from "../store/useAppStore";

export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toUpperCase();
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    target.isContentEditable ||
    target.getAttribute("role") === "textbox"
  );
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    token,
    viewMode,
    setViewMode,
    fetchVideos,
    fetchPlaylists,
    isSettingsOpen,
    setSettingsOpen,
    isPlaylistManagerOpen,
    setPlaylistManagerOpen,
    isStorageManagerOpen,
    setStorageManagerOpen,
    isAdminOpen,
    setAdminOpen,
    isAddDownloadOpen,
    setAddDownloadOpen,
    isShortcutsHelpOpen,
    setShortcutsHelpOpen,
  } = useAppStore();

  useEffect(() => {
    if (!token || !user) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = isInputElement(e.target);
      const isMac = typeof navigator !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key;

      // 1. Escape: Close open modals or blur active input
      if (key === "Escape") {
        if (
          isShortcutsHelpOpen ||
          isAddDownloadOpen ||
          isSettingsOpen ||
          isPlaylistManagerOpen ||
          isStorageManagerOpen ||
          isAdminOpen
        ) {
          e.preventDefault();
          setShortcutsHelpOpen(false);
          setAddDownloadOpen(false);
          setSettingsOpen(false);
          setPlaylistManagerOpen(false);
          setStorageManagerOpen(false);
          setAdminOpen(false);
          return;
        }
        if (isInput && e.target instanceof HTMLElement) {
          e.target.blur();
          return;
        }
      }

      // 2. Search Shortcut: Ctrl+K or / (when not typing)
      if ((cmdOrCtrl && key.toLowerCase() === "k") || (!isInput && key === "/")) {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input") as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 3. New Download Shortcut: Ctrl+N or Alt+N or 'n' (when not typing)
      if (
        (cmdOrCtrl && key.toLowerCase() === "n") ||
        (e.altKey && key.toLowerCase() === "n") ||
        (!isInput && !e.altKey && !cmdOrCtrl && !e.shiftKey && key.toLowerCase() === "n")
      ) {
        e.preventDefault();
        setAddDownloadOpen(true);
        return;
      }

      // 4. Help Cheat Sheet Shortcut: ? (Shift+/) or Ctrl+/
      if ((cmdOrCtrl && key === "/") || (!isInput && (key === "?" || (e.shiftKey && key === "/")))) {
        e.preventDefault();
        setShortcutsHelpOpen(!isShortcutsHelpOpen);
        return;
      }

      // 5. Settings Shortcut: Ctrl+, or Alt+S
      if ((cmdOrCtrl && key === ",") || (e.altKey && key.toLowerCase() === "s")) {
        e.preventDefault();
        setSettingsOpen(!isSettingsOpen);
        return;
      }

      // 6. Navigation Shortcuts (Alt+H, Alt+D, Alt+W, Alt+P, Alt+A, Alt+M, Alt+V, Alt+T, Alt+R)
      if (e.altKey && !cmdOrCtrl) {
        const lower = key.toLowerCase();
        if (lower === "h" || lower === "d") {
          e.preventDefault();
          navigate("/");
          return;
        }
        if (lower === "w") {
          e.preventDefault();
          navigate("/watch_later");
          return;
        }
        if (lower === "p") {
          e.preventDefault();
          if (location.pathname === "/playlists") {
            setPlaylistManagerOpen(!isPlaylistManagerOpen);
          } else {
            navigate("/playlists");
          }
          return;
        }
        if (lower === "a" && user?.role === "admin") {
          e.preventDefault();
          setAdminOpen(!isAdminOpen);
          return;
        }
        if (lower === "m") {
          e.preventDefault();
          setStorageManagerOpen(!isStorageManagerOpen);
          return;
        }
        if (lower === "v") {
          e.preventDefault();
          setViewMode(viewMode === "grid" ? "table" : "grid");
          return;
        }
        if (lower === "t") {
          e.preventDefault();
          const isDark = document.documentElement.classList.contains("dark");
          if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
          } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
          }
          return;
        }
        if (lower === "r") {
          e.preventDefault();
          fetchVideos();
          fetchPlaylists();
          return;
        }
      }

      // 7. Non-Input Quick Single-Key Toggles
      if (!isInput && !cmdOrCtrl && !e.altKey) {
        if (key.toLowerCase() === "v") {
          e.preventDefault();
          setViewMode(viewMode === "grid" ? "table" : "grid");
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    token,
    user,
    viewMode,
    setViewMode,
    fetchVideos,
    fetchPlaylists,
    navigate,
    location.pathname,
    isSettingsOpen,
    setSettingsOpen,
    isPlaylistManagerOpen,
    setPlaylistManagerOpen,
    isStorageManagerOpen,
    setStorageManagerOpen,
    isAdminOpen,
    setAdminOpen,
    isAddDownloadOpen,
    setAddDownloadOpen,
    isShortcutsHelpOpen,
    setShortcutsHelpOpen,
  ]);
}
