import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { PasswordInputField } from "./PasswordInputField";
import { RoleDropdownField } from "./RoleDropdownField";
import { UsernameInputField } from "./UsernameInputField";

interface CreateUserDialogProps {
  visible: boolean;
  onHide: () => void;
  onSubmit: (
    username: string,
    password: string,
    role: "admin" | "user",
  ) => Promise<void>;
  loading: boolean;
}

export function CreateUserDialog({
  visible,
  onHide,
  onSubmit,
  loading,
}: CreateUserDialogProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"admin" | "user">("user");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(username, password, role);
    setUsername("");
    setPassword("");
    setRole("user");
  };

  return (
    <Dialog
      header="Create User Account"
      visible={visible}
      onHide={onHide}
      style={{ width: "95vw", maxWidth: "400px" }}
      dismissableMask
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 py-1 font-sans"
      >
        <UsernameInputField value={username} onChange={setUsername} />
        <PasswordInputField value={password} onChange={setPassword} />
        <RoleDropdownField value={role} onChange={setRole} />

        <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700/50">
          <Button
            label="Cancel"
            severity="secondary"
            size="small"
            onClick={onHide}
          />
          <Button
            label="Create"
            icon="pi pi-check"
            severity="success"
            size="small"
            loading={loading}
            type="submit"
          />
        </div>
      </form>
    </Dialog>
  );
}

export default CreateUserDialog;
