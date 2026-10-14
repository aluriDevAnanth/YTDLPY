import { DataTable } from "primereact/datatable";
import type { PlaylistT } from "src/schema";
import {
  PlaylistActionsColumn,
  PlaylistNameColumn,
  PlaylistVideoCountColumn,
} from "../columns";

interface PlaylistManagerTableProps {
  playlists: PlaylistT[];
  filters: any;
  activePlaylistId: string | null;
  onViewPlaylist: (playlist: PlaylistT) => void;
  onDeletePlaylist: (id: string) => void;
}

export function PlaylistManagerTable({
  playlists,
  filters,
  activePlaylistId,
  onViewPlaylist,
  onDeletePlaylist,
}: PlaylistManagerTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
      <DataTable
        value={playlists}
        filters={filters}
        globalFilterFields={["name", "description"]}
        paginator
        rows={5}
        stripedRows
        size="small"
        emptyMessage="No playlists found."
        className="text-xs"
        pt={{
          header: { className: "bg-transparent p-0" },
          table: { className: "w-full text-xs" },
        }}
      >
        <PlaylistNameColumn activePlaylistId={activePlaylistId} />
        <PlaylistVideoCountColumn />
        <PlaylistActionsColumn
          activePlaylistId={activePlaylistId}
          onViewPlaylist={onViewPlaylist}
          onDeletePlaylist={onDeletePlaylist}
        />
      </DataTable>
    </div>
  );
}

export default PlaylistManagerTable;
