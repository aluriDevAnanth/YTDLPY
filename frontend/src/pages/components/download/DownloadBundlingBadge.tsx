import { ProgressSpinner } from "primereact/progressspinner";

interface DownloadBundlingBadgeProps {
  displayPercent: number;
}

export function DownloadBundlingBadge({
  displayPercent,
}: DownloadBundlingBadgeProps) {
  return (
    <div className="w-full min-w-[140px] max-w-[190px] flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium tabular-nums">
      <div className="flex items-center gap-1.5 truncate">
        <ProgressSpinner
          strokeWidth="6"
          animationDuration="1.2s"
          className="size-3.5 p-0 m-0 shrink-0 text-amber-400"
        />
        <span className="truncate">Packing container</span>
      </div>
      <span className="font-mono text-amber-300 font-bold shrink-0">
        {displayPercent > 0 ? `${displayPercent}%` : "99%"}
      </span>
    </div>
  );
}

export default DownloadBundlingBadge;
