import { InputTextarea } from "primereact/inputtextarea";

interface ToastDetailInputProps {
  detail: string;
  setDetail: (val: string) => void;
}

export function ToastDetailInput({
  detail,
  setDetail,
}: ToastDetailInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Detailed Message
      </label>
      <InputTextarea
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="Enter detailed toast text message..."
        rows={2}
        className="p-inputtext-sm w-full rounded-xl resize-none"
      />
    </div>
  );
}

export default ToastDetailInput;
