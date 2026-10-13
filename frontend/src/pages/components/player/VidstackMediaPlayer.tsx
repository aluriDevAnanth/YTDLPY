import {
  MediaPlayer,
  type MediaPlayerInstance,
  MediaProvider,
  Poster,
  Track,
} from "@vidstack/react";
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { forwardRef } from "react";
import type { VideoT } from "src/schema";
import { getAuthToken } from "src/store/useAppStore";
import { API_BASE } from "src/store/storage";
import { BoostSpeedMenu } from "./controls";

interface VidstackMediaPlayerProps {
  rowData: VideoT;
  speedIndex: number;
  playbackRate: number;
  onPlay: () => void;
  onSpeedChange: (newSpeed: number) => void;
}

export const VidstackMediaPlayer = forwardRef<
  MediaPlayerInstance,
  VidstackMediaPlayerProps
>(({ rowData, speedIndex, onPlay, onSpeedChange }, ref) => {
  const fileBaseUrl =
    import.meta.env.VITE_FILE_BASE_URL || `${API_BASE}/api/files/`;
  const token = getAuthToken() || "";

  const videoSrc = `${fileBaseUrl}${rowData.id}_video.mp4?token=${token}`;
  const posterSrc = `${fileBaseUrl}${rowData.id}_thumbnail.jpg?token=${token}`;
  const trackSrc = `${fileBaseUrl}${rowData.id}_vtt.vtt?token=${token}`;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <MediaPlayer
        ref={ref}
        title={rowData.fullTitle}
        src={{
          src: videoSrc,
          type: rowData.audioOnly ? "audio/mp4" : "video/mp4",
        }}
        currentTime={rowData.prevWatchTime}
        onPlay={onPlay}
        className="w-full aspect-video"
      >
        <MediaProvider>
          <Poster
            className="vds-poster"
            src={posterSrc}
            alt={rowData.fullTitle}
          />
          {rowData.vttSpritePathId && (
            <Track
              src={trackSrc}
              kind={"thumbnails" as any}
              label="Preview Thumbnails"
              default
            />
          )}
        </MediaProvider>

        {rowData.audioOnly ? (
          <DefaultAudioLayout icons={defaultLayoutIcons} />
        ) : (
          <DefaultVideoLayout
            icons={defaultLayoutIcons}
            slots={{
              beforeCaptionButton: (
                <BoostSpeedMenu
                  speed={speedIndex}
                  onSpeedChange={onSpeedChange}
                />
              ),
            }}
          />
        )}
      </MediaPlayer>
    </div>
  );
});

VidstackMediaPlayer.displayName = "VidstackMediaPlayer";

export default VidstackMediaPlayer;
