import { Icon } from "@iconify/react";
import { OverlayPanel } from "primereact/overlaypanel";
import { forwardRef } from "react";
import { Link } from "react-router";
import type { PlaylistT } from "src/schema";
import { PlaylistDropdownItem } from "./PlaylistDropdownItem";

interface PlaylistDropdownProps {
  currentPath: string;
  customPlaylists: PlaylistT[];
}

export const PlaylistDropdown = forwardRef<
  OverlayPanel,
  PlaylistDropdownProps
>(({ currentPath, customPlaylists }, ref) => {
  const closePanel = () => {
    if (ref && "current" in ref && ref.current) {
      ref.current.hide();
    }
  };

  return (
    <OverlayPanel
      ref={ref}
      dismissable
      className="dark:bg-[#18181b] dark:text-white dark:border-gray-800 rounded-xl shadow-2xl p-0 w-60 border border-gray-200"
    >
      <div className="flex flex-col p-1 gap-0.5 text-xs font-sans">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-1">
          Your Playlists
        </span>

        <Link
          to="/watch_later"
          onClick={closePanel}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors no-underline ${
            currentPath === "/watch_later"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Icon icon="tabler:clock" className="text-base text-amber-500" />
          <span className="font-semibold">Watch Later</span>
        </Link>

        {customPlaylists.map((pl) => (
          <PlaylistDropdownItem
            key={pl.id}
            playlist={pl}
            isActive={currentPath === `/${pl.public_id || pl.id}`}
            onClick={closePanel}
          />
        ))}

        <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

        <Link
          to="/playlists"
          onClick={closePanel}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-500 text-left font-medium no-underline"
        >
          <Icon icon="tabler:plus" className="text-base" />
          <span>Manage All Playlists...</span>
        </Link>
      </div>
    </OverlayPanel>
  );
});

PlaylistDropdown.displayName = "PlaylistDropdown";

export default PlaylistDropdown;
