import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import type { ToastLogEntry } from "../toastTestingTypes";
import { ToastHistoryLogItem } from "./ToastHistoryLogItem";

interface ToastHistoryLogProps {
  logs: ToastLogEntry[];
  onClear: () => void;
  onRetrigger: (log: ToastLogEntry) => void;
}

export function ToastHistoryLog({
  logs,
  onClear,
  onRetrigger,
}: ToastHistoryLogProps) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/60 pb-3">
        <span className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <Icon
            icon="tabler:history"
            className="text-cyan-600 dark:text-cyan-400 text-xl"
          />
          Session Toast Trigger History ({logs.length})
        </span>

        {logs.length > 0 && (
          <Button
            label="Clear Log"
            icon="pi pi-trash"
            severity="secondary"
            text
            size="small"
            onClick={onClear}
          />
        )}
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">
          No toasts fired yet in this session. Use the controls above to launch
          toasts!
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {logs.map((log) => (
            <ToastHistoryLogItem
              key={log.id}
              log={log}
              onRetrigger={onRetrigger}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ToastHistoryLog;
