import { Button } from "primereact/button";
import { getSeverityBadgeClass, type ToastLogEntry } from "../toastTestingTypes";

interface ToastHistoryLogItemProps {
  log: ToastLogEntry;
  onRetrigger: (log: ToastLogEntry) => void;
}

export function ToastHistoryLogItem({
  log,
  onRetrigger,
}: ToastHistoryLogItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/40 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border uppercase ${getSeverityBadgeClass(
            log.severity,
          )}`}
        >
          {log.severity}
        </span>
        <span className="font-semibold text-gray-900 dark:text-white truncate">
          {log.summary}
        </span>
        <span className="text-gray-500 dark:text-gray-400 truncate hidden sm:inline">
          — {log.detail}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
          {log.timestamp} ({log.position})
        </span>

        <Button
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          className="p-button-sm size-7 !p-0"
          tooltip="Re-trigger"
          onClick={() => onRetrigger(log)}
        />
      </div>
    </div>
  );
}

export default ToastHistoryLogItem;
