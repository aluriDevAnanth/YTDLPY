import { memo } from "react";
import type { VideoT } from "src/schema";
import { VideoCardMetaInfo } from "./VideoCardMetaInfo";
import { VideoCardQuickActions } from "./VideoCardQuickActions";
import { VideoCardTitle } from "./VideoCardTitle";

interface VideoCardDetailsProps {
  video: VideoT;
  isCompleted: boolean;
  isCopied: boolean;
  onPlayClick: () => void;
  onCopyUrl: (e: React.MouseEvent) => void;
  onOpenMenuButton: (e: React.MouseEvent) => void;
}

export const VideoCardDetails = memo(
  ({
    video,
    isCompleted,
    isCopied,
    onPlayClick,
    onCopyUrl,
    onOpenMenuButton,
  }: VideoCardDetailsProps) => {
    return (
      <div className="flex flex-col px-2.5 py-2 gap-1.5 grow justify-between bg-white dark:bg-transparent">
        <div className="flex flex-col gap-0.5">
          <VideoCardTitle
            title={video.fullTitle}
            url={video.url}
            isCompleted={isCompleted}
            onPlayClick={onPlayClick}
          />

          <div className="flex items-center justify-between">
            <VideoCardMetaInfo size={video.size} format={video.format} />
            <VideoCardQuickActions
              isCopied={isCopied}
              onCopyUrl={onCopyUrl}
              onOpenMenuButton={onOpenMenuButton}
            />
          </div>
        </div>
      </div>
    );
  },
);

VideoCardDetails.displayName = "VideoCardDetails";

export default VideoCardDetails;
