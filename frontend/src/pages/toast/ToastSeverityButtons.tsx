import { Icon } from "@iconify/react";
import type { SeverityType } from "./toastTestingTypes";

interface ToastSeverityButtonsProps {
  severity: SeverityType;
  onSelectSeverity: (sev: SeverityType) => void;
}

export function ToastSeverityButtons({
  severity,
  onSelectSeverity,
}: ToastSeverityButtonsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Select Toast Severity
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(["success", "info", "warn", "error"] as SeverityType[]).map((sev) => {
          const isSelected = severity === sev;
          return (
            <button
              key={sev}
              type="button"
              onClick={() => onSelectSeverity(sev)}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20"
                  : "border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon
                icon={
                  sev === "success"
                    ? "tabler:circle-check"
                    : sev === "info"
                      ? "tabler:info-circle"
                      : sev === "warn"
                        ? "tabler:alert-triangle"
                        : "tabler:circle-x"
                }
                className="text-base"
              />
              <span>{sev}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ToastSeverityButtons;
