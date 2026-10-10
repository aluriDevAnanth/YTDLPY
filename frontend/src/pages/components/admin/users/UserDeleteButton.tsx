import { Button } from "primereact/button";
import type { User } from "src/context/authStore";

interface UserDeleteButtonProps {
  user: User;
  currentUser: User | null;
  onDelete: (user: User) => void;
}

export function UserDeleteButton({
  user,
  currentUser,
  onDelete,
}: UserDeleteButtonProps) {
  const isSelf = user.id === currentUser?.id;

  return (
    <Button
      icon="pi pi-trash"
      severity="danger"
      outlined
      className="p-button-sm py-1 px-2"
      disabled={isSelf}
      onClick={() => onDelete(user)}
      tooltip={isSelf ? "Cannot delete own admin account" : "Delete user"}
    />
  );
}

export default UserDeleteButton;
