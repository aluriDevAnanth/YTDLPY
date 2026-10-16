import { FilterMatchMode } from "primereact/api";
import { Column, type ColumnProps } from "primereact/column";
import { TableFilterInput } from "../cells/TableFilterInput";

export function ResolutionColumn(props?: ColumnProps) {
  return (
    <Column
      field="resolution"
      header="Resolution"
      sortable
      filter
      filterPlaceholder="e.g. 720p"
      showFilterMenu={false}
      filterMatchMode={FilterMatchMode.CONTAINS}
      filterElement={(options: any) => (
        <TableFilterInput options={options} placeholder="e.g. 720" />
      )}
      {...props}
    />
  );
}

export default ResolutionColumn;
