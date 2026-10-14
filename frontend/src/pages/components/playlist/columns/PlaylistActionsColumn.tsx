import { Column, type ColumnProps } from "primereact/column";
import type { PlaylistT } from "src/schema";
import { PlaylistRowActions } from "../table/PlaylistRowActions";

interface PlaylistActionsColumnProps extends ColumnProps {
  activePlaylistId: string | null;
  onViewPlaylist: (playlist: PlaylistT) => void;
  onDeletePlaylist: (id: string) => void;
}

export function PlaylistActionsColumn({
  activePlaylistId,
  onViewPlaylist,
  onDeletePlaylist,
  ...props
}: PlaylistActionsColumnProps) {
  return (
    <Column
      header="Actions"
      body={(pl: PlaylistT) => (
        <PlaylistRowActions
          playlist={pl}
          isActive={activePlaylistId === pl.id}
          onView={() => onViewPlaylist(pl)}
          onDelete={() => onDeletePlaylist(pl.id)}
        />
      )}
      style={{ width: "130px", textAlign: "right" }}
      {...props}
    />
  );
}

export default PlaylistActionsColumn;
