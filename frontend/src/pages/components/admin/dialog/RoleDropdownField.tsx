import { Dropdown } from "primereact/dropdown";
import { roleOptions } from "../adminTypes";

interface RoleDropdownFieldProps {
  value: "admin" | "user";
  onChange: (val: "admin" | "user") => void;
}

export function RoleDropdownField({
  value,
  onChange,
}: RoleDropdownFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Role
      </label>
      <Dropdown
        value={value}
        options={roleOptions}
        onChange={(e) => onChange(e.value)}
        className="w-full p-inputtext-sm"
      />
    </div>
  );
}

export default RoleDropdownField;
