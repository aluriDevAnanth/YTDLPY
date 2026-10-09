import { ProgressBar } from "primereact/progressbar";

interface DownloadProgressPercentProps {
  displayPercent: number;
}

export function DownloadProgressPercent({
  displayPercent,
}: DownloadProgressPercentProps) {
  return (
    <div className="flex gap-1 items-center">
      <ProgressBar
        className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 items-center"
        value={displayPercent}
        showValue={false}
      />
      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono tabular-nums">
        {displayPercent > 0 ? `${displayPercent}%` : "0%"}
      </span>
    </div>
  );
}

export default DownloadProgressPercent;
