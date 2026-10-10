import { Column, type ColumnProps } from "primereact/column";
import type { User } from "src/context/authStore";
import { UserRoleTag } from "./UserRoleTag";

export function UserRoleColumn(props?: ColumnProps) {
  return (
    <Column
      field="role"
      header="Role"
      body={(row: User) => <UserRoleTag role={row.role} />}
      {...props}
    />
  );
}

export default UserRoleColumn;
