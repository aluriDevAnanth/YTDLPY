import { FilterMatchMode } from "primereact/api";
import { Column, type ColumnProps } from "primereact/column";
import { TableFilterInput } from "../cells/TableFilterInput";

export function SizeColumn(props?: ColumnProps) {
  return (
    <Column
      field="size"
      header="Size"
      sortable
      showFilterMenu={false}
      filter
      filterMatchMode={FilterMatchMode.CONTAINS}
      filterElement={(options: any) => (
        <TableFilterInput options={options} placeholder="e.g. 20MiB" />
      )}
      {...props}
    />
  );
}

export default SizeColumn;
