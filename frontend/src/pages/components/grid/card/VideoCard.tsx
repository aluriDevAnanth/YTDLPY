import axios from "axios";
import { memo, useEffect, useMemo, useState } from "react";
import useVideoStore from "src/context/videoStore";
import type { VideoT } from "src/schema";
import { getAuthToken } from "src/store/useAppStore";
import VideoDialog from "../../VideoDialog";
import { VideoCardDetails } from "./VideoCardDetails";
import { VideoThumbnail } from "./VideoThumbnail";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

interface VideoCardProps {
  video: VideoT;
  onOpenContextMenu: (e: React.MouseEvent, video: VideoT) => void;
  onOpenMenuButton: (e: React.MouseEvent, video: VideoT) => void;
  onCopyUrl: (e: React.MouseEvent, video: VideoT) => void;
  copiedVideoId: string | null;
}

export const VideoCard = memo(
  ({
    video,
    onOpenContextMenu,
    onOpenMenuButton,
    onCopyUrl,
    copiedVideoId,
  }: VideoCardProps) => {
    const [playVisible, setPlayVisible] = useState(false);
    const [imgError, setImgError] = useState(false);
    const upsertVideo = useVideoStore((state) => state.upsertVideo);
    const videoProgress = useVideoStore((state) => state.videoProgress);
    const pauseVideo = useVideoStore((state) => state.pauseVideo);
    const resumeVideo = useVideoStore((state) => state.resumeVideo);
    const retryVideo = useVideoStore((state) => state.retryVideo);
    const playlists = useVideoStore((state) => state.playlists);
    const toggleWatchLater = useVideoStore((state) => state.toggleWatchLater);

    const watchLaterPlaylist = useMemo(
      () => playlists.find((p) => p.is_default),
      [playlists],
    );
    const inWatchLater = useMemo(
      () => watchLaterPlaylist?.video_ids.includes(video.id),
      [watchLaterPlaylist, video.id],
    );

    const rawProgress = useMemo(
      () => videoProgress[video.id],
      [videoProgress, video.id],
    );

    const displayPercent = useMemo(() => {
      const val = rawProgress?.percent?.toString().replace("%", "");
      if (val !== undefined && val !== null && val !== "") {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) return parsed;
      }
      return 0;
    }, [rawProgress]);

    useEffect(() => {
      if (
        displayPercent === 100 &&
        video.downloadStatus !== "completed" &&
        video.downloadStatus !== "generating_sprites"
      ) {
        axios
          .get<VideoT>(`${API_BASE}/api/video/${video.id}`)
          .then((response) => upsertVideo(response.data))
          .catch(console.error);
      }
    }, [displayPercent, video.id, video.downloadStatus, upsertVideo]);

    const fileBaseUrl =
      import.meta.env.VITE_FILE_BASE_URL || "http://localhost:8000/api/files/";
    const token = getAuthToken() || "";
    const thumbnailUrl = `${fileBaseUrl}${video.id}_thumbnail?token=${token}`;

    const isCompleted =
      video.downloadStatus === "completed" && thumbnailUrl && !imgError;
    const isCopied = copiedVideoId === video.id;

    return (
      <div
        onContextMenu={(e) => onOpenContextMenu(e, video)}
        className="group flex flex-col bg-white dark:bg-gray-900/70 hover:bg-slate-50 dark:hover:bg-transparent border border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
      >
        {/* Video Dialog */}
        {playVisible && (
          <VideoDialog
            visible={playVisible}
            setVisible={setPlayVisible}
            rowData={video}
          />
        )}

        <VideoThumbnail
          video={video}
          thumbnailUrl={thumbnailUrl}
          isCompleted={!!isCompleted}
          imgError={imgError}
          setImgError={setImgError}
          displayPercent={displayPercent}
          rawProgress={rawProgress}
          inWatchLater={inWatchLater}
          onPlayClick={() => setPlayVisible(true)}
          onToggleWatchLater={(e) => {
            e.stopPropagation();
            toggleWatchLater(video.id);
          }}
          onPause={pauseVideo}
          onResume={resumeVideo}
          onRetry={retryVideo}
        />

        <VideoCardDetails
          video={video}
          isCompleted={!!isCompleted}
          isCopied={isCopied}
          onPlayClick={() => setPlayVisible(true)}
          onCopyUrl={(e) => onCopyUrl(e, video)}
          onOpenMenuButton={(e) => onOpenMenuButton(e, video)}
        />
      </div>
    );
  },
);

VideoCard.displayName = "VideoCard";

export default VideoCard;
