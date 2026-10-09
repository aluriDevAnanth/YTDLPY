import { Icon } from "@iconify/react";
import type { VideoProgressT, VideoT } from "src/schema";

interface VideoCardProgressOverlayProps {
  video: VideoT;
  displayPercent: number;
  rawProgress?: VideoProgressT;
  onPause: (videoId: string) => void;
  onResume: (videoId: string) => void;
  onRetry: (videoId: string) => void;
}

export function VideoCardProgressOverlay({
  video,
  displayPercent,
  rawProgress,
  onPause,
  onResume,
  onRetry,
}: VideoCardProgressOverlayProps) {
  return (
    <div className="relative w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800/60 overflow-hidden">
      {/* Pulsing Skeleton Shimmer Layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 via-cyan-500/20 to-cyan-900/30 animate-pulse pointer-events-none z-0" />

      {/* YTDLnis-style card-wide progress fill overlay */}
      <div
        className="absolute inset-y-0 left-0 bg-cyan-500/25 border-r border-cyan-400/50 transition-all duration-300 pointer-events-none z-0"
        style={{ width: `${Math.max(displayPercent, 0)}%` }}
      />

      {/* Top Bar: Status & Percentage */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Icon
            icon={
              video.downloadStatus === "failed"
                ? "tabler:alert-triangle"
                : video.downloadStatus === "paused"
                  ? "tabler:player-pause"
                  : video.downloadStatus === "generating_sprites"
                    ? "tabler:movie"
                    : "tabler:download"
            }
            className={`text-sm ${
              video.downloadStatus === "failed"
                ? "text-red-500 font-bold"
                : video.downloadStatus === "paused"
                  ? "text-amber-500"
                  : "text-cyan-600 dark:text-cyan-400 animate-pulse"
            }`}
          />
          {video.downloadStatus === "failed"
            ? "Failed"
            : video.downloadStatus === "paused"
              ? "Paused"
              : video.downloadStatus === "generating_sprites"
                ? "Generating Sprites..."
                : video.downloadStatus === "queued"
                  ? "Queued..."
                  : "Downloading..."}
        </span>
        <span className="font-bold text-xs text-gray-900 dark:text-white font-mono">
          {displayPercent > 0 ? `${displayPercent.toFixed(1)}%` : "0.0%"}
        </span>
      </div>

      {/* Middle Section: Centered Resume / Pause / Retry Action Button */}
      <div className="relative z-20 flex items-center justify-center my-auto">
        {video.downloadStatus === "failed" ? (
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              onRetry(video.id);
            }}
            icon="tabler:refresh"
            className="text-5xl gap-1.5 rounded-full bg-transparent hover:text-cyan-400 text-white font-bold hover:scale-110 transition-all cursor-pointer border-0"
          />
        ) : video.downloadStatus === "paused" ? (
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              onResume(video.id);
            }}
            icon="tabler:player-play"
            className="gap-1.5 rounded-full bg-transparent hover:text-emerald-400 text-white font-bold hover:scale-110 transition-all cursor-pointer border-0 text-5xl"
          />
        ) : (
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              onPause(video.id);
            }}
            icon="tabler:player-pause"
            className="text-5xl gap-1.5 rounded-full bg-transparent hover:text-amber-400 text-white font-semibold shadow-md hover:scale-105 transition-all cursor-pointer border-0"
          />
        )}
      </div>

      <div>
        <div className="relative z-10 flex items-center justify-between text-[12px] font-mono">
          <span>
            ⚡{" "}
            {video.downloadStatus === "failed"
              ? "Failed"
              : video.downloadStatus === "paused"
                ? "Paused"
                : rawProgress?.speed || "0 B/s"}
          </span>
        </div>
        <div className="relative z-10 flex items-center justify-between text-[12px] font-mono">
          <span>
            ⏱️{" "}
            {video.downloadStatus === "failed"
              ? "Failed"
              : video.downloadStatus === "paused"
                ? "Paused"
                : rawProgress?.eta || "Calculating..."}
          </span>
        </div>
      </div>
    </div>
  );
}

export default VideoCardProgressOverlay;
