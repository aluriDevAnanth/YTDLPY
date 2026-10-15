import { InputNumber } from "primereact/inputnumber";

interface MaxConcurrentInputProps {
  maxConcurrent: number;
  setMaxConcurrent: (count: number) => void;
}

export function MaxConcurrentInput({
  maxConcurrent,
  setMaxConcurrent,
}: MaxConcurrentInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-200">
        Max Concurrent Downloads (1-10)
      </label>
      <InputNumber
        value={maxConcurrent}
        onValueChange={(e) => setMaxConcurrent(e.value || 3)}
        min={1}
        max={10}
        showButtons
        buttonLayout="horizontal"
        decrementButtonClassName="p-button-secondary"
        incrementButtonClassName="p-button-secondary"
        className="w-full text-xs"
      />
    </div>
  );
}

export default MaxConcurrentInput;
