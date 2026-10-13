import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import type { VideoT } from "../../../schema";
import useAppStore from "../../../store/useAppStore";
import { PlaylistCreateInlineForm } from "./dialog/PlaylistCreateInlineForm";
import { PlaylistItemRow } from "./dialog/PlaylistItemRow";

interface AddToPlaylistDialogProps {
  video: VideoT | null;
  visible: boolean;
  onHide: () => void;
}

export function AddToPlaylistDialog({
  video,
  visible,
  onHide,
}: AddToPlaylistDialogProps) {
  const playlists = useAppStore((state) => state.playlists);
  const fetchPlaylists = useAppStore((state) => state.fetchPlaylists);
  const addVideoToPlaylist = useAppStore((state) => state.addVideoToPlaylist);
  const removeVideoFromPlaylist = useAppStore(
    (state) => state.removeVideoFromPlaylist,
  );
  const createPlaylist = useAppStore((state) => state.createPlaylist);

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPlaylists();
    }
  }, [visible, fetchPlaylists]);

  if (!video) return null;

  const handleToggle = async (playlistId: string, isInPlaylist: boolean) => {
    setLoading(true);
    try {
      if (isInPlaylist) {
        await removeVideoFromPlaylist(playlistId, video.id);
      } else {
        await addVideoToPlaylist(playlistId, video.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim()) return;
    setLoading(true);
    try {
      const created = await createPlaylist(newPlaylistName.trim());
      if (created) {
        await addVideoToPlaylist(created.id, video.id);
        setNewPlaylistName("");
        setShowCreate(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={`Save "${video.fullTitle || video.id}" to Playlist`}
      visible={visible}
      style={{ width: "420px" }}
      onHide={onHide}
      dismissableMask
      className="dark:bg-[#18181b] dark:text-white"
    >
      <div className="flex flex-col gap-3 py-2">
        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
          {playlists.map((pl) => (
            <PlaylistItemRow
              key={pl.id}
              playlist={pl}
              isInPlaylist={pl.video_ids.includes(video.id)}
              loading={loading}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {showCreate ? (
          <PlaylistCreateInlineForm
            newPlaylistName={newPlaylistName}
            setNewPlaylistName={setNewPlaylistName}
            loading={loading}
            onCancel={() => setShowCreate(false)}
            onSubmit={handleCreateAndAdd}
          />
        ) : (
          <Button
            onClick={() => setShowCreate(true)}
            severity="info"
            outlined
            className="w-full flex items-center justify-center gap-2 text-sm mt-1"
          >
            <Icon icon="tabler:plus" className="text-base" />
            <span>Create New Playlist</span>
          </Button>
        )}
      </div>
    </Dialog>
  );
}

export default AddToPlaylistDialog;
