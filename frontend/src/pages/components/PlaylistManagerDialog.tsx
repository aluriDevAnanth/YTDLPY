import { Icon } from "@iconify/react";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAppStore from "src/store/useAppStore";
import type { PlaylistT } from "src/schema";
import { pt } from "src/pt";

export default function PlaylistManagerDialog() {
  const navigate = useNavigate();
  const isPlaylistManagerOpen = useAppStore((state) => state.isPlaylistManagerOpen);
  const setPlaylistManagerOpen = useAppStore((state) => state.setPlaylistManagerOpen);
  const playlists = useAppStore((state) => state.playlists);
  const fetchPlaylists = useAppStore((state) => state.fetchPlaylists);
  const createPlaylist = useAppStore((state) => state.createPlaylist);
  const deletePlaylist = useAppStore((state) => state.deletePlaylist);
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylistId = useAppStore((state) => state.setActivePlaylistId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
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

  const nameTemplate = (pl: PlaylistT) => {
    const isActive = activePlaylistId === pl.id;
    return (
      <div className="flex items-center gap-3 min-w-0 py-1">
        <div
          className={`p-2 rounded-xl shrink-0 ${pl.is_default ? "bg-amber-500/20 text-amber-400" : "bg-cyan-500/20 text-cyan-400"
            }`}
        >
          <Icon icon={pl.is_default ? "tabler:clock" : "tabler:playlist"} className="text-xl" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-sm truncate ${isActive ? "text-cyan-500" : "text-gray-900 dark:text-white"}`}>
              {pl.name}
            </span>
            {pl.is_default && (
              <Tag value="SYSTEM" severity="warning" className="text-[9px] px-1.5 py-0.2 uppercase font-mono" />
            )}
            {isActive && (
              <Tag value="ACTIVE" severity="success" className="text-[9px] px-1.5 py-0.2 uppercase font-mono" />
            )}
          </div>
          {pl.description && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {pl.description}
            </span>
          )}
        </div>
      </div>
    );
  };

  const videoCountTemplate = (pl: PlaylistT) => {
    return (
      <div className="flex items-center gap-1">
        <Tag
          value={`${pl.video_count} video${pl.video_count === 1 ? "" : "s"}`}
          severity="info"
          className="text-xs font-semibold px-2 py-0.5"
        />
      </div>
    );
  };

  const actionsTemplate = (pl: PlaylistT) => {
    const isActive = activePlaylistId === pl.id;
    const targetRoute = pl.is_default ? "/watch_later" : `/${pl.public_id || pl.id}`;

    return (
      <div className="flex items-center gap-1.5 justify-end">
        <Button
          severity={isActive ? "success" : "secondary"}
          outlined={!isActive}
          size="small"
          onClick={() => {
            if (isActive) {
              setActivePlaylistId(null);
              navigate("/");
            } else {
              setActivePlaylistId(pl.id);
              navigate(targetRoute);
            }
            setPlaylistManagerOpen(false);
          }}
          tooltip={isActive ? "Currently Viewing" : "Open Playlist"}
          className="text-xs px-2.5 py-1 rounded-lg"
        >
          <Icon icon={isActive ? "tabler:check" : "tabler:eye"} className="mr-1 text-sm" />
          <span>{isActive ? "Active" : "View"}</span>
        </Button>

        {!pl.is_default && (
          <Button
            severity="danger"
            text
            size="small"
            onClick={() => deletePlaylist(pl.id)}
            tooltip="Delete Playlist"
            className="p-1 rounded-lg hover:bg-red-500/10"
          >
            <Icon icon="tabler:trash" className="text-base text-red-400" />
          </Button>
        )}
      </div>
    );
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
      className="dark:bg-[#18181b] dark:text-white" pt={pt.dialog}
    >
      <div className="flex flex-col gap-4 py-1 font-sans">
        {/* Create New Playlist Form Card */}
        <div className="flex flex-col gap-2.5 p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <Icon icon="tabler:plus" className="text-cyan-500 text-base" />
              <span>Create New Playlist</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist Title (e.g. Favorites, Music)"
              className="w-full text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            <InputText
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>

          <Button
            label="Create Playlist"
            severity="success"
            size="small"
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            icon={<Icon icon="tabler:plus" className="mr-1 text-base" />}
            className="self-end mt-0.5 text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs"
          />
        </div>

        {/* DataTable Section Header & Live Filter Input */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-800 pt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Playlists ({playlists.length})
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Icon icon="tabler:search" className="absolute left-2.5 top-2.5 text-gray-400 text-sm pointer-events-none" />
            <InputText
              value={globalFilterValue}
              onChange={handleSearchChange}
              placeholder="Search playlists..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl"
            />
            {globalFilterValue && (
              <button
                type="button"
                onClick={() => {
                  setGlobalFilterValue("");
                  setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
                }}
                className="absolute right-2 top-2 text-gray-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <Icon icon="tabler:x" className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* PrimeReact DataTable */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
          <DataTable
            value={playlists}
            filters={filters}
            globalFilterFields={["name", "description"]}
            paginator
            rows={5}
            stripedRows
            size="small"
            emptyMessage="No playlists found."
            className="text-xs"
            pt={{
              header: { className: "bg-transparent p-0" },
              table: { className: "w-full text-xs" },
            }}
          >
            <Column
              field="name"
              header="Playlist"
              sortable
              body={nameTemplate}
              className="dark:text-white font-medium"
            />
            <Column
              field="video_count"
              header="Videos"
              sortable
              body={videoCountTemplate}
              style={{ width: "110px" }}
            />
            <Column
              header="Actions"
              body={actionsTemplate}
              style={{ width: "130px", textAlign: "right" }}
            />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
}
