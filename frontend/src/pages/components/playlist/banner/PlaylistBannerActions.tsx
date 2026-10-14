import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Link } from "react-router";
import type { PlaylistT, VideoT } from "src/schema";
import { PlayAllButton } from "./PlayAllButton";

interface PlaylistBannerActionsProps {
  activePlaylist: PlaylistT;
  playlistVideos: VideoT[];
  onPlayFirstVideo?: (video: VideoT) => void;
  onDeletePlaylist: (id: string) => void;
  onCloseBanner: () => void;
}

export function PlaylistBannerActions({
  activePlaylist,
  playlistVideos,
  onPlayFirstVideo,
  onDeletePlaylist,
  onCloseBanner,
}: PlaylistBannerActionsProps) {
  const handlePlayAll = () => {
    if (playlistVideos.length > 0 && onPlayFirstVideo) {
      onPlayFirstVideo(playlistVideos[0]);
    }
  };

  return (
    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
      {playlistVideos.length > 0 && onPlayFirstVideo && (
        <PlayAllButton onClick={handlePlayAll} />
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
          onClick={() => onDeletePlaylist(activePlaylist.id)}
          severity="danger"
          outlined
          className="!border-red-500/40 !text-red-400 hover:!bg-red-500/10 text-xs px-3 py-2 rounded-xl"
          tooltip="Delete Playlist"
        >
          <Icon icon="tabler:trash" className="text-base" />
        </Button>
      )}

      <Button
        onClick={onCloseBanner}
        severity="secondary"
        text
        className="!text-gray-400 hover:!text-white text-xs p-2 rounded-xl"
        tooltip="Back to All Videos"
      >
        <Icon icon="tabler:x" className="text-lg" />
      </Button>
    </div>
  );
}

export default PlaylistBannerActions;
