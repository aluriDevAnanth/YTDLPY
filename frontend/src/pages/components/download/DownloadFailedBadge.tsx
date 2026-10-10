import { Icon } from "@iconify/react";

interface DownloadFailedBadgeProps {
  onRetry: () => void;
}

export function DownloadFailedBadge({ onRetry }: DownloadFailedBadgeProps) {
  return (
    <div className="w-full min-w-[140px] max-w-[190px] flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium tabular-nums">
      <div className="flex items-center gap-1.5 truncate">
        <Icon
          icon="tabler:alert-triangle"
          className="text-red-400 text-sm shrink-0"
        />
        <span className="truncate font-semibold text-red-300">Failed</span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRetry();
        }}
        className="p-1 rounded hover:bg-red-900/60 text-red-200 hover:text-white transition-colors cursor-pointer border-0 flex items-center justify-center shrink-0"
        title="Retry Download"
      >
        <Icon icon="tabler:refresh" className="text-sm" />
      </button>
    </div>
  );
}

export default DownloadFailedBadge;
