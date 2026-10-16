import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";

export function StorageSizeColumn(props?: ColumnProps) {
  return (
    <Column
      field="size"
      header="Disk Size"
      sortable
      body={(row: VideoT) => (
        <span className="font-mono font-bold text-amber-400 text-xs">
          {row.size || "0 B"}
        </span>
      )}
      {...props}
    />
  );
}

export default StorageSizeColumn;
