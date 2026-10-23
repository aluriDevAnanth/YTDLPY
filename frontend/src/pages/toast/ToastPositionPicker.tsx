import { Icon } from "@iconify/react";
import type { PositionType } from "./toastTestingTypes";

interface ToastPositionPickerProps {
  position: PositionType;
  onSelectPosition: (pos: PositionType) => void;
}

export function ToastPositionPicker({
  position,
  onSelectPosition,
}: ToastPositionPickerProps) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm">
      <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
        <Icon icon="tabler:target" className="text-cyan-600 dark:text-cyan-400 text-lg" />
        Click Position Grid to Fire Toast
      </span>

      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
        {[
          { label: "Top-Left", val: "top-left" as PositionType },
          { label: "Top-Center", val: "top-center" as PositionType },
          { label: "Top-Right", val: "top-right" as PositionType },
          { label: "Bot-Left", val: "bottom-left" as PositionType },
          { label: "Bot-Center", val: "bottom-center" as PositionType },
          { label: "Bot-Right", val: "bottom-right" as PositionType },
        ].map((pos) => (
          <button
            key={pos.val}
            type="button"
            onClick={() => onSelectPosition(pos.val)}
            className={`p-3 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
              position === pos.val
                ? "border-cyan-500 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-extrabold shadow-xs"
                : "border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-cyan-400"
            }`}
          >
            {pos.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToastPositionPicker;
