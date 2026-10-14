import { Column, type ColumnProps } from "primereact/column";
import type { PlaylistT } from "src/schema";
import { PlaylistNameCell } from "../table/PlaylistNameCell";

interface PlaylistNameColumnProps extends ColumnProps {
  activePlaylistId: string | null;
}

export function PlaylistNameColumn({
  activePlaylistId,
  ...props
}: PlaylistNameColumnProps) {
  return (
    <Column
      field="name"
      header="Playlist"
      sortable
      body={(pl: PlaylistT) => (
        <PlaylistNameCell
          playlist={pl}
          isActive={activePlaylistId === pl.id}
        />
      )}
      className="dark:text-white font-medium"
      {...props}
    />
  );
}

export default PlaylistNameColumn;
