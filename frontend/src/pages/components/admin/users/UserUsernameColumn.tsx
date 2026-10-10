import { Column, type ColumnProps } from "primereact/column";

export function UserUsernameColumn(props?: ColumnProps) {
  return (
    <Column
      field="username"
      header="Username"
      sortable
      className="font-medium"
      {...props}
    />
  );
}

export default UserUsernameColumn;
