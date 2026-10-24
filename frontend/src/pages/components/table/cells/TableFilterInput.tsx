import { InputText } from "primereact/inputtext";

interface TableFilterInputProps {
  options: any;
  placeholder: string;
}

export function TableFilterInput({ options, placeholder }: TableFilterInputProps) {
  return (
    <InputText
      value={options.value || ""}
      onChange={(e) => options.filterApplyCallback(e.target.value)}
      placeholder={placeholder}
      className="p-inputtext-sm py-0.5 px-1.5 text-xs w-full"
    />
  );
}

export default TableFilterInput;
