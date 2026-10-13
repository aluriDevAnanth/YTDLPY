import { useMemo } from "react";
import { useNavigate } from "react-router";
import useVideoStore from "src/context/videoStore";
import type { VideoT } from "src/schema";
import { PlaylistBannerActions } from "./PlaylistBannerActions";
import { PlaylistBannerIcon } from "./PlaylistBannerIcon";
import { PlaylistBannerInfo } from "./PlaylistBannerInfo";

interface PlaylistBannerProps {
  onPlayFirstVideo?: (video: VideoT) => void;
}

export function PlaylistBanner({ onPlayFirstVideo }: PlaylistBannerProps) {
  const navigate = useNavigate();
  const playlists = useVideoStore((state) => state.playlists);
  const activePlaylistId = useVideoStore((state) => state.activePlaylistId);
  const setActivePlaylistId = useVideoStore((state) => state.setActivePlaylistId);
  const deletePlaylist = useVideoStore((state) => state.deletePlaylist);
  const videos = useVideoStore((state) => state.videos);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId),
    [playlists, activePlaylistId],
  );

  if (!activePlaylist) return null;

  const playlistVideos = Object.values(videos).filter((v) =>
    activePlaylist.video_ids.includes(v.id),
  );

  return (
    <div className="w-full mb-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-gray-900 to-black border border-gray-800 shadow-xl p-4 sm:p-6 text-white relative overflow-hidden transition-all">
      {/* Decorative Background Glow */}
      <div className="absolute -top-12 -right-12 size-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <PlaylistBannerIcon isDefault={activePlaylist.is_default} />
          <PlaylistBannerInfo
            playlist={activePlaylist}
            videoCount={playlistVideos.length}
          />
        </div>

        <PlaylistBannerActions
          activePlaylist={activePlaylist}
          playlistVideos={playlistVideos}
          onPlayFirstVideo={onPlayFirstVideo}
          onDeletePlaylist={deletePlaylist}
          onCloseBanner={() => {
            setActivePlaylistId(null);
            navigate("/");
          }}
        />
      </div>
    </div>
  );
}

export default PlaylistBanner;
