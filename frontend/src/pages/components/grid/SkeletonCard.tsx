import { Icon } from "@iconify/react";
import { memo } from "react";

export const SkeletonCard = memo(() => (
  <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-xl overflow-hidden shadow-xs hover:shadow-sm animate-pulse">
    {/* 16:9 Thumbnail Skeleton Box with Vibrant Gradient Shimmer */}
    <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800/90 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700/80 dark:to-gray-800 animate-pulse" />
      <Icon
        icon="tabler:video"
        className="relative z-10 text-3xl text-gray-400 dark:text-gray-500/80 animate-pulse"
      />
    </div>

    {/* Details Skeleton Lines */}
    <div className="flex flex-col p-2.5 gap-2">
      <div className="h-3.5 w-4/5 bg-gray-300 dark:bg-gray-700/80 rounded-xs animate-pulse" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-2.5 w-1/3 bg-gray-200 dark:bg-gray-700/60 rounded-xs animate-pulse" />
        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700/70 rounded-xs animate-pulse" />
      </div>
    </div>
  </div>
));

SkeletonCard.displayName = "SkeletonCard";
