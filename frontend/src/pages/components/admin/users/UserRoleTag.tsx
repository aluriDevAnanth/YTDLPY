import { Tag } from "primereact/tag";

interface UserRoleTagProps {
  role: string;
}

export function UserRoleTag({ role }: UserRoleTagProps) {
  return (
    <Tag
      value={role.toUpperCase()}
      severity={role === "admin" ? "danger" : "info"}
      className="text-[10px] font-mono font-bold"
    />
  );
}

export default UserRoleTag;
