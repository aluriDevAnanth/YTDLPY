import { Icon } from "@iconify/react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { memo } from "react";
import type { VideoT } from "src/schema";
import { StorageActionsColumn } from "./StorageActionsColumn";
import { StorageSizeColumn } from "./StorageSizeColumn";
import { StorageStatusColumn } from "./StorageStatusColumn";
import { StorageTitleColumn } from "./StorageTitleColumn";
import { StorageWatchedColumn } from "./StorageWatchedColumn";

interface StorageTableProps {
  videoList: VideoT[];
  selectedVideos: VideoT[];
  onSelectionChange: (videos: VideoT[]) => void;
  filters: any;
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSingle: (video: VideoT) => void;
}

export const StorageTable = memo(
  ({
    videoList,
    selectedVideos,
    onSelectionChange,
    filters,
    globalFilterValue,
    onGlobalFilterChange,
    onDeleteSingle,
  }: StorageTableProps) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
            <Icon
              icon="tabler:list-details"
              className="text-cyan-400 text-sm"
            />
            Media Storage Breakdown
          </span>
          <span className="p-input-icon-left w-48 sm:w-64">
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Filter videos..."
              className="p-inputtext-sm w-full text-xs"
            />
          </span>
        </div>

        <DataTable
          value={videoList}
          selection={selectedVideos}
          onSelectionChange={(e: any) => onSelectionChange(e.value)}
          selectionMode="checkbox"
          dataKey="id"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 20]}
          size="small"
          stripedRows
          filters={filters}
          globalFilterFields={[
            "fullTitle",
            "url",
            "format",
            "resolution",
            "downloadStatus",
          ]}
          className="text-xs rounded-lg overflow-hidden border border-gray-800"
          emptyMessage="No downloads found in your library."
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <StorageTitleColumn />
          <StorageStatusColumn />
          <StorageWatchedColumn />
          <StorageSizeColumn />
          <StorageActionsColumn onDeleteSingle={onDeleteSingle} />
        </DataTable>
      </div>
    );
  },
);

StorageTable.displayName = "StorageTable";

export default StorageTable;
