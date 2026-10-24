import { InputText } from "primereact/inputtext";

interface ToastSummaryInputProps {
  summary: string;
  setSummary: (val: string) => void;
}

export function ToastSummaryInput({
  summary,
  setSummary,
}: ToastSummaryInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Toast Title (Summary)
      </label>
      <InputText
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Enter toast title..."
        className="p-inputtext-sm w-full rounded-xl"
      />
    </div>
  );
}

export default ToastSummaryInput;
