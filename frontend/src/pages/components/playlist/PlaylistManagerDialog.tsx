import { Icon } from "@iconify/react";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { pt } from "src/pt";
import type { PlaylistT } from "src/schema";
import useAppStore from "src/store/useAppStore";
import { PlaylistCreateCard } from "./cards";
import { PlaylistManagerHeader } from "./PlaylistManagerHeader";
import { PlaylistManagerTable } from "./table/PlaylistManagerTable";

export function PlaylistManagerDialog() {
  const navigate = useNavigate();
  const isPlaylistManagerOpen = useAppStore(
    (state) => state.isPlaylistManagerOpen,
  );
  const setPlaylistManagerOpen = useAppStore(
    (state) => state.setPlaylistManagerOpen,
  );
  const playlists = useAppStore((state) => state.playlists);
  const fetchPlaylists = useAppStore((state) => state.fetchPlaylists);
  const createPlaylist = useAppStore((state) => state.createPlaylist);
  const deletePlaylist = useAppStore((state) => state.deletePlaylist);
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylistId = useAppStore(
    (state) => state.setActivePlaylistId,
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: {
      value: null as string | null,
      matchMode: FilterMatchMode.CONTAINS,
    },
  });

  useEffect(() => {
    if (isPlaylistManagerOpen) {
      fetchPlaylists();
    }
  }, [isPlaylistManagerOpen, fetchPlaylists]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      global: { value: value || null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const handleClearSearch = () => {
    setGlobalFilterValue("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createPlaylist(name.trim(), description.trim());
      setName("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlaylist = (pl: PlaylistT) => {
    const isActive = activePlaylistId === pl.id;
    const targetRoute = pl.is_default
      ? "/watch_later"
      : `/${pl.public_id || pl.id}`;

    if (isActive) {
      setActivePlaylistId(null);
      navigate("/");
    } else {
      setActivePlaylistId(pl.id);
      navigate(targetRoute);
    }
    setPlaylistManagerOpen(false);
  };

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-base sm:text-lg">
          <Icon icon="tabler:playlist" className="text-cyan-500 text-xl" />
          <span>Playlist Management Studio</span>
        </div>
      }
      visible={isPlaylistManagerOpen}
      style={{ width: "90vw", height: "90vh" }}
      onHide={() => setPlaylistManagerOpen(false)}
      dismissableMask
      className="dark:bg-[#18181b] dark:text-white"
      pt={pt.dialog}
    >
      <div className="flex flex-col gap-4 py-1 font-sans">
        <PlaylistCreateCard
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          loading={loading}
          onCreate={handleCreate}
        />

        <PlaylistManagerHeader
          count={playlists.length}
          globalFilterValue={globalFilterValue}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
        />

        <PlaylistManagerTable
          playlists={playlists}
          filters={filters}
          activePlaylistId={activePlaylistId}
          onViewPlaylist={handleViewPlaylist}
          onDeletePlaylist={deletePlaylist}
        />
      </div>
    </Dialog>
  );
}

export default PlaylistManagerDialog;
