import { Column, type ColumnProps } from "primereact/column";
import type { PlaylistT } from "src/schema";
import { PlaylistVideoCountCell } from "../table/PlaylistVideoCountCell";

export function PlaylistVideoCountColumn(props?: ColumnProps) {
  return (
    <Column
      field="video_count"
      header="Videos"
      sortable
      body={(pl: PlaylistT) => <PlaylistVideoCountCell playlist={pl} />}
      style={{ width: "110px" }}
      {...props}
    />
  );
}

export default PlaylistVideoCountColumn;
