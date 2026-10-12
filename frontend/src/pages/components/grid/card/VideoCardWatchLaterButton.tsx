import { Icon } from "@iconify/react";

interface VideoCardWatchLaterButtonProps {
  inWatchLater?: boolean;
  onToggleWatchLater: (e: React.MouseEvent) => void;
}

export function VideoCardWatchLaterButton({
  inWatchLater,
  onToggleWatchLater,
}: VideoCardWatchLaterButtonProps) {
  return (
    <div className="absolute top-1.5 right-1.5 z-20">
      <button
        type="button"
        onClick={onToggleWatchLater}
        className={`p-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer border-0 flex items-center justify-center ${
          inWatchLater
            ? "bg-amber-500 text-black font-bold shadow-md scale-105"
            : "bg-black/60 text-white/80 hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100"
        }`}
        title={
          inWatchLater ? "Remove from Watch Later" : "Save to Watch Later"
        }
      >
        <Icon
          icon={inWatchLater ? "tabler:clock-check" : "tabler:clock"}
          className="text-base"
        />
      </button>
    </div>
  );
}

export default VideoCardWatchLaterButton;
