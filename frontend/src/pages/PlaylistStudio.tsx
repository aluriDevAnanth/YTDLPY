import { Icon } from "@iconify/react";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import useAppStore from "src/store/useAppStore";
import type { PlaylistT } from "src/schema";
import { pt } from "src/pt";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";

export default function PlaylistStudio() {
  const playlists = useAppStore((state) => state.playlists);
  const fetchPlaylists = useAppStore((state) => state.fetchPlaylists);
  const createPlaylist = useAppStore((state) => state.createPlaylist);
  const deletePlaylist = useAppStore((state) => state.deletePlaylist);
  const activePlaylistId = useAppStore((state) => state.activePlaylistId);
  const setActivePlaylistId = useAppStore((state) => state.setActivePlaylistId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: {
      value: null as string | null,
      matchMode: FilterMatchMode.CONTAINS,
    },
  });

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

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
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            pl.is_default
              ? "bg-amber-500/20 text-amber-400"
              : "bg-cyan-500/20 text-cyan-400"
          }`}
        >
          <Icon
            icon={pl.is_default ? "tabler:clock" : "tabler:playlist"}
            className="size-5 line-clamp-1"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-bold text-sm truncate ${isActive ? "text-cyan-500" : "text-gray-900 dark:text-white"}`}
            >
              {pl.name}
            </span>
            {pl.is_default && (
              <Tag
                value="SYSTEM"
                severity="warning"
                className="text-white"
                pt={{
                  root: {
                    className: "px-2 py-0.5 rounded-sm bg-orange-500",
                  },
                  value: {
                    className:
                      "text-[10px] font-mono font-extrabold tracking-wider uppercase",
                  },
                }}
              />
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
    const targetRoute = pl.is_default
      ? "/watch_later"
      : `/${pl.public_id || pl.id}`;

    return (
      <div className="flex items-center gap-1.5 justify-end">
        <Link
          to={isActive ? "/" : targetRoute}
          onClick={() => {
            if (isActive) {
              setActivePlaylistId(null);
            } else {
              setActivePlaylistId(pl.id);
            }
          }}
          className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-semibold no-underline transition-all ${
            isActive
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-cyan-500/20 hover:text-cyan-400 border border-gray-200 dark:border-gray-700"
          }`}
        >
          <Icon
            icon={isActive ? "tabler:check" : "tabler:eye"}
            className="text-sm"
          />
          <span>{isActive ? "Active" : "View"}</span>
        </Link>

        {!pl.is_default && (
          <Button
            severity="danger"
            text
            size="small"
            onClick={() => deletePlaylist(pl.id)}
            tooltip="Delete Playlist"
            className="p-2 rounded-xl hover:bg-red-500/10"
          >
            <Icon icon="tabler:trash" className="text-base text-red-400" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 pt-2 mx-auto font-sans">
      <Dialog
        visible={showNewPlaylist}
        onHide={() => setShowNewPlaylist(false)}
        pt={{
          ...pt.dialog,
          root: { className: "" },
        }}
        header="Create Playlist"
        className="h-[30vh] w-[75vw]"
      >
        <div className="flex flex-1 flex-col pt-5 gap-3  bg-transperent  rounded-2xl shadow-sm mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FloatLabel>
              <InputText
                value={name}
                id="playlisttitle"
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-800 focus:border-cyan-500 rounded-xl"
              />
              <label htmlFor="playlisttitle">Playlist Title</label>
            </FloatLabel>
            <FloatLabel>
              <InputText
                value={description}
                id="playlistdesc"
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-800 focus:border-cyan-500 rounded-xl"
              />
              <label htmlFor="playlistdesc">Playlist Description</label>
            </FloatLabel>
          </div>
        </div>
        <div className="flex shrink-0 justify-end my-2">
          <Button
            label="Create Playlist"
            severity="success"
            size="small"
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            icon={<Icon icon="tabler:plus" className="mr-1 text-base" />}
            className="self-end text-xs font-bold px-5 py-2"
          />
        </div>
      </Dialog>

      {/* DataTable Container Card */}
      <div className="flex flex-col gap-3 p-2 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800 px-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">
              Your Playlists ({playlists.length})
            </span>
          </div>

          {/* Search Filter Input */}
          <div className="flex items-center gap-2">
            <Icon
              onClick={() => setShowNewPlaylist(true)}
              icon="tabler:plus"
              className="text-gray-400 text-lg cursor-pointer hover:text-green-400 size-6 stroke-3"
            />

            <div className="relative w-full sm:w-72">
              <Icon
                icon="tabler:search"
                className="absolute left-3 top-2.5 text-gray-400 text-base pointer-events-none"
              />
              <InputText
                value={globalFilterValue}
                onChange={handleSearchChange}
                placeholder="Search playlists..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-cyan-500 rounded-xl"
              />
              {globalFilterValue && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalFilterValue("");
                    setFilters({
                      global: {
                        value: null,
                        matchMode: FilterMatchMode.CONTAINS,
                      },
                    });
                  }}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white border-0 bg-transparent cursor-pointer"
                >
                  <Icon icon="tabler:x" className="text-base" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PrimeReact DataTable */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <DataTable
            value={playlists}
            filters={filters}
            globalFilterFields={["name", "description"]}
            paginator
            rows={8}
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
              header="Playlist Title & Info"
              sortable
              body={nameTemplate}
              className="dark:text-white font-medium"
              pt={{ bodyCell: { className: "py-1 px-2" } }}
            />
            <Column
              field="video_count"
              header="Videos"
              sortable
              body={videoCountTemplate}
              style={{ width: "120px" }}
              pt={{ bodyCell: { className: "py-1 px-2" } }}
            />
            <Column
              header="Actions"
              body={actionsTemplate}
              style={{ width: "150px", textAlign: "right" }}
              pt={{ bodyCell: { className: "py-1 px-2" } }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
}
