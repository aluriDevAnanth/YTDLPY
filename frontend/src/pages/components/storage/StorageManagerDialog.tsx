import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "src/context/authStore";
import type { VideoT } from "src/schema";
import { StorageStatsCards } from "./metrics";
import { StorageHeader } from "./StorageHeader";
import { StorageTable } from "./table";
import { StorageActionsToolbar } from "./toolbar";

export function StorageManagerDialog() {
  const {
    isStorageManagerOpen,
    setStorageManagerOpen,
    storageStats,
    fetchUserStorageStats,
    bulkCleanUserStorage,
    videos,
  } = useAuthStore();

  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<VideoT[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    fullTitle: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const videoList = Object.values(videos);

  useEffect(() => {
    if (isStorageManagerOpen) {
      fetchUserStorageStats();
    }
  }, [isStorageManagerOpen]);

  const handleCleanWatched = async () => {
    if (
      !confirm(
        `Are you sure you want to purge all watched videos? This will free ${
          storageStats?.formatted_watched_bytes || "storage space"
        }.`,
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await bulkCleanUserStorage({ clean_watched: true });
      toast.current?.show({
        severity: "success",
        summary: "Storage Cleaned",
        detail: `Purged ${res.purged_count} watched video(s) and freed ${res.formatted_freed_bytes}.`,
      });
      setSelectedVideos([]);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to purge watched videos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanSelected = async () => {
    if (!selectedVideos.length) return;
    const ids = selectedVideos.map((v) => v.id);
    if (
      !confirm(
        `Purge ${selectedVideos.length} selected video(s) to free disk space?`,
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await bulkCleanUserStorage({ video_ids: ids });
      toast.current?.show({
        severity: "success",
        summary: "Selected Videos Purged",
        detail: `Purged ${res.purged_count} video(s) and freed ${res.formatted_freed_bytes}.`,
      });
      setSelectedVideos([]);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to purge selected videos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        "WARNING: Purge ALL downloaded videos from your library? This cannot be undone.",
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await bulkCleanUserStorage({ clear_all: true });
      toast.current?.show({
        severity: "success",
        summary: "Storage Reset",
        detail: `Purged all ${res.purged_count} video(s) and freed ${res.formatted_freed_bytes}.`,
      });
      setSelectedVideos([]);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to purge videos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAppCache = () => {
    try {
      sessionStorage.clear();
      toast.current?.show({
        severity: "info",
        summary: "App Cache Cleared",
        detail: "Session cache cleared successfully.",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const _filters = { ...filters };
    _filters["global"].value = val;
    setFilters(_filters);
    setGlobalFilterValue(val);
  };

  const handleDeleteSingle = async (row: VideoT) => {
    if (confirm(`Purge '${row.fullTitle || row.url}'?`)) {
      await bulkCleanUserStorage({ video_ids: [row.id] });
      toast.current?.show({
        severity: "success",
        summary: "Video Purged",
        detail: `Purged '${row.fullTitle || row.url}'`,
      });
    }
  };

  return (
    <Dialog
      header={<StorageHeader storageStats={storageStats} />}
      visible={isStorageManagerOpen}
      style={{ width: "95vw", maxWidth: "900px" }}
      onHide={() => setStorageManagerOpen(false)}
      dismissableMask
      className="font-sans"
    >
      <Toast ref={toast} />

      <div className="flex flex-col gap-4 py-1 text-xs sm:text-sm">
        <StorageStatsCards storageStats={storageStats} />

        <StorageActionsToolbar
          storageStats={storageStats}
          selectedCount={selectedVideos.length}
          totalVideosCount={videoList.length}
          loading={loading}
          onCleanWatched={handleCleanWatched}
          onCleanSelected={handleCleanSelected}
          onClearAll={handleClearAll}
          onClearAppCache={handleClearAppCache}
        />

        <StorageTable
          videoList={videoList}
          selectedVideos={selectedVideos}
          onSelectionChange={setSelectedVideos}
          filters={filters}
          globalFilterValue={globalFilterValue}
          onGlobalFilterChange={onGlobalFilterChange}
          onDeleteSingle={handleDeleteSingle}
        />
      </div>
    </Dialog>
  );
}

export default StorageManagerDialog;
