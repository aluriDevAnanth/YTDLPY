export function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/60 rounded-xl overflow-hidden shadow-xs animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 relative">
        <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="absolute bottom-1.5 right-1.5 w-12 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col p-2.5 gap-2">
        {/* Title Lines */}
        <div className="flex flex-col gap-1">
          <div className="w-4/5 h-3.5 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-800/60 rounded" />
        </div>

        {/* Meta info & icons */}
        <div className="flex items-center justify-between mt-1">
          <div className="w-16 h-2.5 bg-gray-200 dark:bg-gray-800/80 rounded" />
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
