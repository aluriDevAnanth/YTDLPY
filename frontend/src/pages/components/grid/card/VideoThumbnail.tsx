import { memo } from "react";
import type { VideoProgressT, VideoT } from "src/schema";
import { VideoCardDurationBadge } from "./VideoCardDurationBadge";
import { VideoCardPlayOverlay } from "./VideoCardPlayOverlay";
import { VideoCardProgressOverlay } from "./VideoCardProgressOverlay";
import { VideoCardWatchedBadge } from "./VideoCardWatchedBadge";
import { VideoCardWatchLaterButton } from "./VideoCardWatchLaterButton";

interface VideoThumbnailProps {
  video: VideoT;
  thumbnailUrl: string;
  isCompleted: boolean;
  imgError: boolean;
  setImgError: (err: boolean) => void;
  displayPercent: number;
  rawProgress?: VideoProgressT;
  inWatchLater?: boolean;
  onPlayClick: () => void;
  onToggleWatchLater: (e: React.MouseEvent) => void;
  onPause: (videoId: string) => void;
  onResume: (videoId: string) => void;
  onRetry: (videoId: string) => void;
}

export const VideoThumbnail = memo(
  ({
    video,
    thumbnailUrl,
    isCompleted,
    setImgError,
    displayPercent,
    rawProgress,
    inWatchLater,
    onPlayClick,
    onToggleWatchLater,
    onPause,
    onResume,
    onRetry,
  }: VideoThumbnailProps) => {
    return (
      <div
        className="relative w-full aspect-video bg-gray-100 dark:bg-gray-950 overflow-hidden cursor-pointer select-none"
        onClick={() => isCompleted && onPlayClick()}
      >
        {isCompleted ? (
          <>
            <img
              src={thumbnailUrl}
              alt={video.fullTitle || "Video Thumbnail"}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <VideoCardPlayOverlay />
          </>
        ) : (
          <VideoCardProgressOverlay
            video={video}
            displayPercent={displayPercent}
            rawProgress={rawProgress}
            onPause={onPause}
            onResume={onResume}
            onRetry={onRetry}
          />
        )}

        <VideoCardWatchedBadge watched={video.watched} />
        <VideoCardWatchLaterButton
          inWatchLater={inWatchLater}
          onToggleWatchLater={onToggleWatchLater}
        />
        <VideoCardDurationBadge
          resolution={video.resolution}
          durationString={video.durationString}
        />
      </div>
    );
  },
);

VideoThumbnail.displayName = "VideoThumbnail";

export default VideoThumbnail;
