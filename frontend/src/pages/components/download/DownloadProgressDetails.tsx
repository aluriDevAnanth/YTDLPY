import type { VideoProgressT } from "src/schema";

interface DownloadProgressDetailsProps {
  progress: VideoProgressT;
}

export function DownloadProgressDetails({
  progress,
}: DownloadProgressDetailsProps) {
  return (
    <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400 font-mono tabular-nums">
      <span className="truncate max-w-[90px]">{progress.downloadedSize}</span>
      <span className="text-cyan-600 dark:text-cyan-400 truncate max-w-[65px]">
        {progress.speed}
      </span>
      <span className="text-amber-600 dark:text-amber-400 truncate max-w-[55px]">
        {progress.eta}
      </span>
    </div>
  );
}

export default DownloadProgressDetails;
