import { Icon } from "@iconify/react";
import React from "react";
import type { PlaylistT } from "src/schema";

export interface PlaylistItemRowProps {
  playlist: PlaylistT;
  isInPlaylist: boolean;
  loading: boolean;
  onToggle: (playlistId: string, isInPlaylist: boolean) => void;
}

export const PlaylistItemRow: React.FC<PlaylistItemRowProps> = ({
  playlist,
  isInPlaylist,
  loading,
  onToggle,
}) => {
  return (
    <div
      onClick={() => !loading && onToggle(playlist.id, isInPlaylist)}
      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
        isInPlaylist
          ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
          : "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon
          icon={playlist.is_default ? "tabler:clock" : "tabler:playlist"}
          className={`text-lg shrink-0 ${
            playlist.is_default ? "text-amber-400" : "text-cyan-400"
          }`}
        />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm truncate">{playlist.name}</span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {playlist.video_count} video{playlist.video_count === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div
        className={`size-5 rounded border flex items-center justify-center transition-colors ${
          isInPlaylist
            ? "bg-cyan-500 border-cyan-500 text-black font-bold"
            : "border-gray-400 dark:border-gray-600"
        }`}
      >
        {isInPlaylist && <Icon icon="tabler:check" className="text-xs stroke-[3]" />}
      </div>
    </div>
  );
};

export default PlaylistItemRow;
