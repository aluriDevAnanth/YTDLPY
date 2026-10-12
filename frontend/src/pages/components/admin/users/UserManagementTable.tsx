import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import type { User } from "src/context/authStore";
import { UserActionsColumn } from "./UserActionsColumn";
import { UserJoinedColumn } from "./UserJoinedColumn";
import { UserRoleColumn } from "./UserRoleColumn";
import { UserUsernameColumn } from "./UserUsernameColumn";

interface UserManagementTableProps {
  users: User[];
  loading: boolean;
  currentUser: User | null;
  onAddUserClick: () => void;
  onDeleteUser: (user: User) => void;
}

export function UserManagementTable({
  users,
  loading,
  currentUser,
  onAddUserClick,
  onDeleteUser,
}: UserManagementTableProps) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 bg-white dark:bg-gray-800/40 p-2.5 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm transition-colors">
      <div className="flex justify-between items-center px-1">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-200">
          User Accounts
        </span>
        <Button
          label="Add User"
          icon="pi pi-user-plus"
          severity="success"
          size="small"
          onClick={onAddUserClick}
        />
      </div>
      <DataTable
        value={users}
        loading={loading}
        stripedRows
        size="small"
        className="text-xs rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700/40"
      >
        <UserUsernameColumn />
        <UserRoleColumn />
        <UserJoinedColumn />
        <UserActionsColumn
          currentUser={currentUser}
          onDeleteUser={onDeleteUser}
        />
      </DataTable>
    </div>
  );
}

export default UserManagementTable;
