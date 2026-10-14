import { Icon } from "@iconify/react";
import { Tag } from "primereact/tag";
import type { PlaylistT } from "src/schema";

interface PlaylistNameCellProps {
  playlist: PlaylistT;
  isActive: boolean;
}

export function PlaylistNameCell({
  playlist,
  isActive,
}: PlaylistNameCellProps) {
  return (
    <div className="flex items-center gap-3 min-w-0 py-1">
      <div
        className={`p-2 rounded-xl shrink-0 ${
          playlist.is_default
            ? "bg-amber-500/20 text-amber-400"
            : "bg-cyan-500/20 text-cyan-400"
        }`}
      >
        <Icon
          icon={playlist.is_default ? "tabler:clock" : "tabler:playlist"}
          className="text-xl"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-bold text-sm truncate ${
              isActive ? "text-cyan-500" : "text-gray-900 dark:text-white"
            }`}
          >
            {playlist.name}
          </span>
          {playlist.is_default && (
            <Tag
              value="SYSTEM"
              severity="warning"
              className="text-[9px] px-1.5 py-0.2 uppercase font-mono"
            />
          )}
          {isActive && (
            <Tag
              value="ACTIVE"
              severity="success"
              className="text-[9px] px-1.5 py-0.2 uppercase font-mono"
            />
          )}
        </div>
        {playlist.description && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {playlist.description}
          </span>
        )}
      </div>
    </div>
  );
}

export default PlaylistNameCell;
