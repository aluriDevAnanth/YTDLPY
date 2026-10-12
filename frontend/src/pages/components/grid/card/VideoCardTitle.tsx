interface VideoCardTitleProps {
  title?: string;
  url?: string;
  isCompleted: boolean;
  onPlayClick: () => void;
}

export function VideoCardTitle({
  title,
  url,
  isCompleted,
  onPlayClick,
}: VideoCardTitleProps) {
  const displayTitle = title || url || "Untitled";

  return (
    <span
      onClick={() => isCompleted && onPlayClick()}
      className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer transition-colors leading-tight"
      title={displayTitle}
    >
      {displayTitle}
    </span>
  );
}

export default VideoCardTitle;
