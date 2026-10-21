import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";
import { StorageWatchedTag } from "./StorageWatchedTag";

export function StorageWatchedColumn(props?: ColumnProps) {
  return (
    <Column
      field="watched"
      header="Watched"
      sortable
      body={(row: VideoT) => (
        <StorageWatchedTag watched={!!row.watched} />
      )}
      {...props}
    />
  );
}

export default StorageWatchedColumn;
