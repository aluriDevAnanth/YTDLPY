import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";
import { StorageStatusTag } from "./StorageStatusTag";

export function StorageStatusColumn(props?: ColumnProps) {
  return (
    <Column
      field="downloadStatus"
      header="Status"
      sortable
      body={(row: VideoT) => (
        <StorageStatusTag status={row.downloadStatus} />
      )}
      {...props}
    />
  );
}

export default StorageStatusColumn;
