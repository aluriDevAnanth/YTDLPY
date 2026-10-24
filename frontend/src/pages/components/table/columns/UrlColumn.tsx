import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";
import { TableUrlCell } from "../cells/TableUrlCell";

export function UrlColumn(props?: ColumnProps) {
  return (
    <Column
      field="url"
      header="URL"
      body={(rowData: VideoT) => <TableUrlCell rowData={rowData} />}
      {...props}
    />
  );
}

export default UrlColumn;
