import { Icon } from "@iconify/react";
import { Link } from "react-router";
import type { PlaylistT } from "src/schema";

interface PlaylistDropdownItemProps {
  playlist: PlaylistT;
  isActive: boolean;
  onClick: () => void;
}

export function PlaylistDropdownItem({
  playlist,
  isActive,
  onClick,
}: PlaylistDropdownItemProps) {
  const targetPath = `/${playlist.public_id || playlist.id}`;

  return (
    <Link
      to={targetPath}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors no-underline ${
        isActive
          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold"
          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <Icon icon="tabler:playlist" className="text-base text-cyan-500" />
      <span className="truncate">{playlist.name}</span>
    </Link>
  );
}

export default PlaylistDropdownItem;
