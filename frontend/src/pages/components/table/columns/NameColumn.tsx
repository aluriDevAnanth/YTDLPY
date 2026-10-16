import { FilterMatchMode } from "primereact/api";
import { Column, type ColumnProps } from "primereact/column";
import { TableFilterInput } from "../cells/TableFilterInput";

export function NameColumn(props?: ColumnProps) {
  return (
    <Column
      field="fullTitle"
      header="Name"
      sortable
      filter
      filterPlaceholder="Search by name"
      showFilterMenu={false}
      filterMatchMode={FilterMatchMode.CONTAINS}
      filterElement={(options: any) => (
        <TableFilterInput options={options} placeholder="Search by name" />
      )}
      {...props}
    />
  );
}

export default NameColumn;
