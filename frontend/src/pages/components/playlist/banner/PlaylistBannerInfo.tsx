import type { PlaylistT } from "src/schema";

interface PlaylistBannerInfoProps {
  playlist: PlaylistT;
  videoCount: number;
}

export function PlaylistBannerInfo({
  playlist,
  videoCount,
}: PlaylistBannerInfoProps) {
  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight truncate text-white">
          {playlist.name}
        </h2>
        {playlist.is_default && (
          <span className="text-[10px] font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
            System Default
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-gray-400 mt-0.5 line-clamp-1">
        {playlist.description ||
          (playlist.is_default
            ? "Videos saved to watch later"
            : "Custom playlist collection")}
      </p>

      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 font-medium">
        <span>
          {videoCount} video{videoCount === 1 ? "" : "s"}
        </span>
        <span>•</span>
        <span className="text-cyan-400">Private Playlist</span>
      </div>
    </div>
  );
}

export default PlaylistBannerInfo;
