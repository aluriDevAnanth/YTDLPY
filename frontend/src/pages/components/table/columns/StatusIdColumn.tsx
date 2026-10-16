import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";
import ProgressBarOrID from "../../ProgressBarOrID";

export function StatusIdColumn(props?: ColumnProps) {
  return (
    <Column
      header="Status / ID"
      style={{ width: "200px", minWidth: "170px", maxWidth: "210px" }}
      body={(rowData: VideoT) => <ProgressBarOrID rowData={rowData} />}
      {...props}
    />
  );
}

export default StatusIdColumn;
