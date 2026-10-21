import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";

export function StorageTitleColumn(props?: ColumnProps) {
  return (
    <Column
      field="fullTitle"
      header="Title"
      sortable
      body={(row: VideoT) => (
        <span
          className="font-medium text-gray-100 truncate max-w-[180px] sm:max-w-xs block"
          title={row.fullTitle || row.url}
        >
          {row.fullTitle || row.url}
        </span>
      )}
      {...props}
    />
  );
}

export default StorageTitleColumn;
