import { Tag } from "primereact/tag";
import type { PlaylistT } from "src/schema";

interface PlaylistVideoCountCellProps {
  playlist: PlaylistT;
}

export function PlaylistVideoCountCell({
  playlist,
}: PlaylistVideoCountCellProps) {
  return (
    <div className="flex items-center gap-1">
      <Tag
        value={`${playlist.video_count} video${playlist.video_count === 1 ? "" : "s"}`}
        severity="info"
        className="text-xs font-semibold px-2 py-0.5"
      />
    </div>
  );
}

export default PlaylistVideoCountCell;
