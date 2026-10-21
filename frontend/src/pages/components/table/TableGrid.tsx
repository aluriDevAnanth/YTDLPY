import { DataTable } from "primereact/datatable";
import { useEffect, useMemo, useState } from "react";
import useVideoStore from "src/context/videoStore";
import type { VideoT } from "src/schema";
import PlaylistBanner from "../PlaylistBanner";
import {
  NameColumn,
  OperationsColumn,
  ResolutionColumn,
  SizeColumn,
  StatusIdColumn,
  TagsColumn,
  UrlColumn,
} from "./columns";

interface TableGridProps {
  onTagDoubleClick: (video: VideoT) => void;
}

export function TableGrid({ onTagDoubleClick }: TableGridProps) {
  const videos = useVideoStore((state) => state.videos);
  const playlists = useVideoStore((state) => state.playlists);
  const activePlaylistId = useVideoStore((state) => state.activePlaylistId);
  const globalFilter = useVideoStore((state) => state.globalFilter);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId),
    [playlists, activePlaylistId],
  );

  const videosData = useMemo(() => {
    let list = Object.values(videos).filter(Boolean);
    if (activePlaylist) {
      list = list.filter((v) => activePlaylist.video_ids.includes(v.id));
    }
    return list;
  }, [videos, activePlaylist]);

  return (
    <div className="w-full">
      <PlaylistBanner />
      <DataTable
        value={videosData}
        loading={loading}
        size="small"
        showGridlines
        stripedRows
        resizableColumns
        reorderableColumns
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        globalFilter={globalFilter}
        removableSort
        sortMode="multiple"
        filterDisplay="row"
        scrollable
        emptyMessage="No Videos, add using above form"
        pt={{
          root: { className: "text-xs rounded-lg w-full overflow-x-auto" },
        }}
      >
        <UrlColumn />
        <OperationsColumn />
        <StatusIdColumn />
        <NameColumn />
        <SizeColumn />
        <ResolutionColumn />
        <TagsColumn onTagDoubleClick={onTagDoubleClick} />
      </DataTable>
    </div>
  );
}

export default TableGrid;
