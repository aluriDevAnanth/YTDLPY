import { Column, type ColumnProps } from "primereact/column";
import type { User } from "src/context/authStore";
import { UserDeleteButton } from "./UserDeleteButton";

interface UserActionsColumnProps extends ColumnProps {
  currentUser: User | null;
  onDeleteUser: (user: User) => void;
}

export function UserActionsColumn({
  currentUser,
  onDeleteUser,
  ...props
}: UserActionsColumnProps) {
  return (
    <Column
      header="Actions"
      body={(row: User) => (
        <UserDeleteButton
          user={row}
          currentUser={currentUser}
          onDelete={onDeleteUser}
        />
      )}
      {...props}
    />
  );
}

export default UserActionsColumn;
