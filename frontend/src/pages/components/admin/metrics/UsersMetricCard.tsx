import { Icon } from "@iconify/react";

interface UsersMetricCardProps {
  totalUsers?: number;
}

export function UsersMetricCard({ totalUsers = 0 }: UsersMetricCardProps) {
  const displayCount = Math.max(0, totalUsers - 1);

  return (
    <div className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 flex items-center justify-between shadow-sm transition-colors">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Users
        </span>
        <span className="text-lg sm:text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
          {displayCount}
        </span>
      </div>
      <div className="p-1.5 sm:p-2.5 rounded-md sm:rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
        <Icon icon="tabler:users" className="text-base sm:text-xl" />
      </div>
    </div>
  );
}

export default UsersMetricCard;
