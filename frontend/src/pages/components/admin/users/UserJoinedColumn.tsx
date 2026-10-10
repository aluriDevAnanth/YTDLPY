import { Column, type ColumnProps } from "primereact/column";
import type { User } from "src/context/authStore";

export function UserJoinedColumn(props?: ColumnProps) {
  return (
    <Column
      field="created_at"
      header="Joined"
      body={(row: User) => new Date(row.created_at).toLocaleDateString()}
      {...props}
    />
  );
}

export default UserJoinedColumn;
