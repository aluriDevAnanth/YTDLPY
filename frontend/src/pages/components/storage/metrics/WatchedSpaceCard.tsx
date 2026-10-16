interface WatchedSpaceCardProps {
  formattedWatchedBytes?: string;
  watchedVideosCount?: number;
}

export function WatchedSpaceCard({
  formattedWatchedBytes = "0 B",
  watchedVideosCount = 0,
}: WatchedSpaceCardProps) {
  return (
    <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex flex-col justify-between">
      <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
        Watched Media Space
      </span>
      <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400 truncate mt-1">
        {formattedWatchedBytes}
      </span>
      <span className="text-[10px] text-gray-400 mt-0.5">
        {watchedVideosCount} watched video(s)
      </span>
    </div>
  );
}

export default WatchedSpaceCard;
