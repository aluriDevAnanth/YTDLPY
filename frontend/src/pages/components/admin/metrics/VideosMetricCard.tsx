import { Icon } from "@iconify/react";

interface VideosMetricCardProps {
  totalVideos?: number;
}

export function VideosMetricCard({ totalVideos = 0 }: VideosMetricCardProps) {
  return (
    <div className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex items-center justify-between shadow-sm transition-colors">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Videos
        </span>
        <span className="text-lg sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
          {totalVideos}
        </span>
      </div>
      <div className="p-1.5 sm:p-2.5 rounded-md sm:rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        <Icon icon="tabler:video" className="text-base sm:text-xl" />
      </div>
    </div>
  );
}

export default VideosMetricCard;
