import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";
import { TableRowOptionsMenu } from "../TableRowOptionsMenu";

export function OperationsColumn(props?: ColumnProps) {
  return (
    <Column
      header="Op"
      body={(rowData: VideoT) => TableRowOptionsMenu(rowData)}
      pt={{ bodyCell: { className: "p-1.5 sm:p-2 overflow-visible" } }}
      {...props}
    />
  );
}

export default OperationsColumn;
