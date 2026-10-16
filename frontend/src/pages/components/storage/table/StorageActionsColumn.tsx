import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";
import { StorageDeleteButton } from "./StorageDeleteButton";

interface StorageActionsColumnProps extends ColumnProps {
  onDeleteSingle: (video: VideoT) => void;
}

export function StorageActionsColumn({
  onDeleteSingle,
  ...props
}: StorageActionsColumnProps) {
  return (
    <Column
      header="Actions"
      body={(row: VideoT) => (
        <StorageDeleteButton video={row} onDelete={onDeleteSingle} />
      )}
      {...props}
    />
  );
}

export default StorageActionsColumn;
