import { Icon } from "@iconify/react";
import { memo } from "react";
import { NavLink } from "react-router";
import type { User } from "src/store/useAppStore";

interface HeaderNavLinksProps {
  user: User | null;
  isPlaylistActive: boolean;
  onOpenPlaylists: (e: React.MouseEvent) => void;
}

export const HeaderNavLinks = memo(
  ({ user, isPlaylistActive, onOpenPlaylists }: HeaderNavLinksProps) => {
    return (
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
          onClick={onOpenPlaylists}
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
    );
  },
);

HeaderNavLinks.displayName = "HeaderNavLinks";
