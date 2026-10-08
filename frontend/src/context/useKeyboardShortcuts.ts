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
    globalFilter,
    setGlobalFilter,
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

    const toggleTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = isInputElement(e.target);
      const isMac = typeof navigator !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key;

      // 1. Escape: Close open modals or clear search and blur active input
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
        if (globalFilter && document.activeElement?.id === "global-search-input") {
          e.preventDefault();
          setGlobalFilter("");
          (document.activeElement as HTMLElement)?.blur();
          return;
        }
        if (isInput && e.target instanceof HTMLElement) {
          e.target.blur();
          return;
        }
      }

      // 2. Search Shortcuts: Ctrl+K, Ctrl+F, or / (when not typing)
      if (
        (cmdOrCtrl && (key.toLowerCase() === "k" || key.toLowerCase() === "f")) ||
        (!isInput && !cmdOrCtrl && !e.altKey && key === "/")
      ) {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input") as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 3. Clear Search Shortcut: Alt+C
      if (e.altKey && !cmdOrCtrl && key.toLowerCase() === "c") {
        e.preventDefault();
        setGlobalFilter("");
        return;
      }

      // 4. Help Cheat Sheet Shortcut: ? (Shift+/), Ctrl+/, or F1
      if (
        (cmdOrCtrl && key === "/") ||
        key === "F1" ||
        (!isInput && (key === "?" || (e.shiftKey && key === "/")))
      ) {
        e.preventDefault();
        setShortcutsHelpOpen(!isShortcutsHelpOpen);
        return;
      }

      // 5. New Download Shortcut: Ctrl+N, Alt+N, or 'n' (when not typing)
      if (
        (cmdOrCtrl && key.toLowerCase() === "n") ||
        (e.altKey && key.toLowerCase() === "n") ||
        (!isInput && !e.altKey && !cmdOrCtrl && !e.shiftKey && key.toLowerCase() === "n")
      ) {
        e.preventDefault();
        setAddDownloadOpen(true);
        return;
      }

      // 6. Settings Shortcut: Ctrl+, or Alt+S
      if ((cmdOrCtrl && key === ",") || (e.altKey && key.toLowerCase() === "s")) {
        e.preventDefault();
        setSettingsOpen(!isSettingsOpen);
        return;
      }

      // 7. Storage Manager Shortcut: Ctrl+Shift+M or Alt+M
      if (
        (cmdOrCtrl && e.shiftKey && key.toLowerCase() === "m") ||
        (e.altKey && !cmdOrCtrl && key.toLowerCase() === "m")
      ) {
        e.preventDefault();
        setStorageManagerOpen(!isStorageManagerOpen);
        return;
      }

      // 8. Navigation & Actions via Alt Key (Alt+1..5, Alt+H, Alt+D, Alt+W, Alt+P, Alt+U, Alt+A, Alt+V, Alt+T, Alt+R)
      if (e.altKey && !cmdOrCtrl) {
        const lower = key.toLowerCase();

        // 1 / H / D -> Home
        if (key === "1" || lower === "h" || lower === "d") {
          e.preventDefault();
          navigate("/");
          return;
        }
        // 2 / W -> Watch Later
        if (key === "2" || lower === "w") {
          e.preventDefault();
          navigate("/watch_later");
          return;
        }
        // 3 / P -> Playlists
        if (key === "3" || lower === "p") {
          e.preventDefault();
          if (location.pathname === "/playlists") {
            setPlaylistManagerOpen(!isPlaylistManagerOpen);
          } else {
            navigate("/playlists");
          }
          return;
        }
        // 4 / U -> Toast Studio
        if (key === "4" || lower === "u") {
          e.preventDefault();
          navigate("/toast-studio");
          return;
        }
        // 5 / A -> Admin
        if ((key === "5" || lower === "a") && user?.role === "admin") {
          e.preventDefault();
          setAdminOpen(!isAdminOpen);
          return;
        }
        // V -> Toggle View
        if (lower === "v") {
          e.preventDefault();
          setViewMode(viewMode === "grid" ? "table" : "grid");
          return;
        }
        // T -> Toggle Theme
        if (lower === "t") {
          e.preventDefault();
          toggleTheme();
          return;
        }
        // R -> Refresh Data
        if (lower === "r") {
          e.preventDefault();
          fetchVideos();
          fetchPlaylists();
          return;
        }
      }

      // 9. Single-Key Global Shortcuts (when NOT typing in input/textarea)
      if (!isInput && !cmdOrCtrl && !e.altKey && !e.metaKey) {
        const lower = key.toLowerCase();

        // Quick View Switch: 'v'
        if (lower === "v") {
          e.preventDefault();
          setViewMode(viewMode === "grid" ? "table" : "grid");
          return;
        }

        // Quick Theme Switch: 't' or 'd'
        if (lower === "t" || lower === "d") {
          e.preventDefault();
          toggleTheme();
          return;
        }

        // Quick Refresh: 'r'
        if (lower === "r") {
          e.preventDefault();
          fetchVideos();
          fetchPlaylists();
          return;
        }

        // Number Key Navigation (1: Home, 2: Watch Later, 3: Playlists, 4: Toast Studio, 5: Admin)
        if (key === "1") {
          e.preventDefault();
          navigate("/");
          return;
        }
        if (key === "2") {
          e.preventDefault();
          navigate("/watch_later");
          return;
        }
        if (key === "3") {
          e.preventDefault();
          navigate("/playlists");
          return;
        }
        if (key === "4") {
          e.preventDefault();
          navigate("/toast-studio");
          return;
        }
        if (key === "5" && user?.role === "admin") {
          e.preventDefault();
          setAdminOpen(!isAdminOpen);
          return;
        }

        // Smooth Page Scrolling: Home & End
        if (key === "Home") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        if (key === "End") {
          e.preventDefault();
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
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
    globalFilter,
    setGlobalFilter,
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

