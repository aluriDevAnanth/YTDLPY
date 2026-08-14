import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import useAppStore from "src/store/useAppStore";
import type { VideoT } from "src/schema";

interface AddToPlaylistDialogProps {
  video: VideoT | null;
  visible: boolean;
  onHide: () => void;
}

export default function AddToPlaylistDialog({
  video,
  visible,
  onHide,
}: AddToPlaylistDialogProps) {
  const playlists = useAppStore((state) => state.playlists);
  const fetchPlaylists = useAppStore((state) => state.fetchPlaylists);
  const addVideoToPlaylist = useAppStore((state) => state.addVideoToPlaylist);
  const removeVideoFromPlaylist = useAppStore((state) => state.removeVideoFromPlaylist);
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
          {playlists.map((pl) => {
            const inPlaylist = pl.video_ids.includes(video.id);
            return (
              <div
                key={pl.id}
                onClick={() => !loading && handleToggle(pl.id, inPlaylist)}
                className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                  inPlaylist
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                    : "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon
                    icon={pl.is_default ? "tabler:clock" : "tabler:playlist"}
                    className={`text-lg shrink-0 ${
                      pl.is_default ? "text-amber-400" : "text-cyan-400"
                    }`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">
                      {pl.name}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      {pl.video_count} video{pl.video_count === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div
                  className={`size-5 rounded border flex items-center justify-center transition-colors ${
                    inPlaylist
                      ? "bg-cyan-500 border-cyan-500 text-black font-bold"
                      : "border-gray-400 dark:border-gray-600"
                  }`}
                >
                  {inPlaylist && <Icon icon="tabler:check" className="text-xs stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {showCreate ? (
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <InputText
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name..."
              className="w-full text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
            />
            <div className="flex justify-end gap-2">
              <Button
                label="Cancel"
                severity="secondary"
                text
                size="small"
                onClick={() => setShowCreate(false)}
              />
              <Button
                label="Create & Add"
                severity="success"
                size="small"
                onClick={handleCreateAndAdd}
                disabled={!newPlaylistName.trim() || loading}
              />
            </div>
          </div>
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
