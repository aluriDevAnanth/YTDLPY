import { ProgressSpinner } from "primereact/progressspinner";
import type { VideoProgressT } from "src/schema";
import { DownloadProgressDetails } from "./DownloadProgressDetails";
import { DownloadProgressPercent } from "./DownloadProgressPercent";

interface DownloadProgressBarProps {
  progress?: VideoProgressT;
  displayPercent: number;
}

export function DownloadProgressBar({
  progress,
  displayPercent,
}: DownloadProgressBarProps) {
  if (progress) {
    return (
      <div className="w-full min-w-[140px] max-w-[190px] flex flex-col gap-1.5">
        <DownloadProgressPercent displayPercent={displayPercent} />
        <DownloadProgressDetails progress={progress} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-[140px] max-w-[190px] flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <ProgressSpinner
        strokeWidth="6"
        animationDuration="1s"
        className="size-4 p-0 m-0 shrink-0"
      />
      <span className="truncate">Starting download...</span>
    </div>
  );
}

export default DownloadProgressBar;
