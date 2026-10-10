import { InputText } from "primereact/inputtext";

interface UsernameInputFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export function UsernameInputField({
  value,
  onChange,
}: UsernameInputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Username
      </label>
      <InputText
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder="Enter username..."
        className="p-inputtext-sm w-full"
      />
    </div>
  );
}

export default UsernameInputField;
