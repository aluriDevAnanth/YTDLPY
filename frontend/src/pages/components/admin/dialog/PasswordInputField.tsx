import { InputText } from "primereact/inputtext";

interface PasswordInputFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export function PasswordInputField({
  value,
  onChange,
}: PasswordInputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Password
      </label>
      <InputText
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder="Enter password..."
        className="p-inputtext-sm w-full"
      />
    </div>
  );
}

export default PasswordInputField;
