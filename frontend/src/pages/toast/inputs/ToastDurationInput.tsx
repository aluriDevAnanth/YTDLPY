import { InputNumber } from "primereact/inputnumber";

interface ToastDurationInputProps {
  life: number;
  setLife: (val: number) => void;
  disabled: boolean;
}

export function ToastDurationInput({
  life,
  setLife,
  disabled,
}: ToastDurationInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Auto-Close Duration (ms)
      </label>
      <InputNumber
        value={life}
        onValueChange={(e) => setLife(e.value ?? 3000)}
        disabled={disabled}
        min={500}
        max={60000}
        step={500}
        className="w-full p-inputtext-sm rounded-xl"
        suffix=" ms"
      />
    </div>
  );
}

export default ToastDurationInput;
