import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import useVideoStore from "src/context/videoStore";
import type { VideoT } from "src/schema";

interface PlaylistBannerProps {
  onPlayFirstVideo?: (video: VideoT) => void;
}

export default function PlaylistBanner({ onPlayFirstVideo }: PlaylistBannerProps) {
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

  const handlePlayAll = () => {
    if (playlistVideos.length > 0 && onPlayFirstVideo) {
      onPlayFirstVideo(playlistVideos[0]);
    }
  };

  return (
    <div className="w-full mb-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-gray-900 to-black border border-gray-800 shadow-xl p-4 sm:p-6 text-white relative overflow-hidden transition-all">
      {/* Decorative Background Glow */}
      <div className="absolute -top-12 -right-12 size-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Playlist Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`size-14 sm:size-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              activePlaylist.is_default
                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-black"
                : "bg-gradient-to-br from-cyan-500 to-blue-600 text-black"
            }`}
          >
            <Icon
              icon={activePlaylist.is_default ? "tabler:clock" : "tabler:playlist"}
              className="text-3xl sm:text-4xl stroke-[2]"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight truncate text-white">
                {activePlaylist.name}
              </h2>
              {activePlaylist.is_default && (
                <span className="text-[10px] font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  System Default
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 line-clamp-1">
              {activePlaylist.description || (activePlaylist.is_default ? "Videos saved to watch later" : "Custom playlist collection")}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 font-medium">
              <span>{playlistVideos.length} video{playlistVideos.length === 1 ? "" : "s"}</span>
              <span>•</span>
              <span className="text-cyan-400">Private Playlist</span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {playlistVideos.length > 0 && onPlayFirstVideo && (
            <Button
              onClick={handlePlayAll}
              className="!bg-cyan-500 hover:!bg-cyan-400 !text-black font-bold !border-0 text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition-all"
            >
              <Icon icon="tabler:player-play-filled" className="text-base" />
              <span>Play All</span>
            </Button>
          )}

          <Link
            to="/playlists"
            className="!border-gray-700 !text-gray-300 hover:!text-white text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 border border-gray-700 no-underline transition-colors"
            title="Manage Playlists"
          >
            <Icon icon="tabler:playlist" className="text-base" />
            <span className="hidden sm:inline">Manage</span>
          </Link>

          {!activePlaylist.is_default && (
            <Button
              onClick={() => deletePlaylist(activePlaylist.id)}
              severity="danger"
              outlined
              className="!border-red-500/40 !text-red-400 hover:!bg-red-500/10 text-xs px-3 py-2 rounded-xl"
              tooltip="Delete Playlist"
            >
              <Icon icon="tabler:trash" className="text-base" />
            </Button>
          )}

          <Button
            onClick={() => {
              setActivePlaylistId(null);
              navigate("/");
            }}
            severity="secondary"
            text
            className="!text-gray-400 hover:!text-white text-xs p-2 rounded-xl"
            tooltip="Back to All Videos"
          >
            <Icon icon="tabler:x" className="text-lg" />
          </Button>
        </div>
      </div>
    </div>
  );
}
