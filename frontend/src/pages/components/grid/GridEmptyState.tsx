import { Icon } from "@iconify/react";
import { memo } from "react";

interface GridEmptyStateProps {
  globalFilter: string;
  statusFilter: string;
}

export const GridEmptyState = memo(
  ({ globalFilter, statusFilter }: GridEmptyStateProps) => {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-xl">
        <Icon
          icon="tabler:video-off"
          className="text-4xl text-gray-400 dark:text-gray-600 mb-2"
        />
        <p className="text-gray-700 dark:text-gray-100 text-sm font-medium">
          No videos found
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {globalFilter
            ? `No matches for "${globalFilter}"`
            : statusFilter !== "all"
              ? `No videos with status "${statusFilter}"`
              : "Use the top header form to add video downloads"}
        </p>
      </div>
    );
  },
);

GridEmptyState.displayName = "GridEmptyState";
