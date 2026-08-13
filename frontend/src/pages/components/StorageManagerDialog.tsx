import { Icon } from "@iconify/react";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../context/authStore";
import type { VideoT } from "../../schema";

export default function StorageManagerDialog() {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
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

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2 font-sans">
          <Icon icon="tabler:database" className="text-xl text-amber-400" />
          <span className="font-semibold text-base text-gray-100">
            Memory & Storage Manager
          </span>
          <Tag
            value={storageStats?.formatted_bytes || "0 B Used"}
            severity="warning"
            className="text-black text-[10px] font-mono tracking-wider ml-2"
          />
        </div>
      }
      visible={isStorageManagerOpen}
      style={{ width: "95vw", maxWidth: "900px" }}
      onHide={() => setStorageManagerOpen(false)}
      dismissableMask
      className="font-sans"
    >
      <Toast ref={toast} />

      <div className="flex flex-col gap-4 py-1 text-xs sm:text-sm">
        {/* KPI Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Card 1: Total Disk Space */}
          <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
              Total Disk Usage
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-amber-400 truncate mt-1">
              {storageStats?.formatted_bytes || "0 B"}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              {storageStats?.completed_downloads || 0} completed download(s)
            </span>
          </div>

          {/* Card 2: Watched Videos Space */}
          <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
              Watched Media Space
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400 truncate mt-1">
              {storageStats?.formatted_watched_bytes || "0 B"}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              {storageStats?.watched_videos_count || 0} watched video(s)
            </span>
          </div>

          {/* Card 3: Largest File */}
          <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
              Largest Media File
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-indigo-400 truncate mt-1">
              {storageStats?.formatted_largest_bytes || "0 B"}
            </span>
            <span className="text-[10px] text-gray-400 truncate mt-0.5" title={storageStats?.largest_video_title || "None"}>
              {storageStats?.largest_video_title || "No videos"}
            </span>
          </div>

          {/* Card 4: Library Items */}
          <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
              Library Count
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 truncate mt-1">
              {storageStats?.total_videos || 0} Items
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              Active & stored bundles
            </span>
          </div>
        </div>

        {/* Quick Storage Cleanup Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-900/40 border border-gray-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              label="Purge Watched Videos"
              icon="pi pi-check-circle"
              severity="info"
              size="small"
              className="p-button-sm text-xs"
              onClick={handleCleanWatched}
              loading={loading}
              disabled={(storageStats?.watched_videos_count || 0) === 0}
              tooltip="Delete all videos marked as watched to free space"
              tooltipOptions={{ position: "bottom" }}
            />
            <Button
              label={`Purge Selected (${selectedVideos.length})`}
              icon="pi pi-trash"
              severity="warning"
              size="small"
              className="p-button-sm text-xs"
              onClick={handleCleanSelected}
              loading={loading}
              disabled={!selectedVideos.length}
              tooltip="Delete selected videos from disk"
              tooltipOptions={{ position: "bottom" }}
            />
            <Button
              label="Purge All Videos"
              icon="pi pi-power-off"
              severity="danger"
              outlined
              size="small"
              className="p-button-sm text-xs"
              onClick={handleClearAll}
              loading={loading}
              disabled={!videoList.length}
              tooltip="Clear entire download library"
              tooltipOptions={{ position: "bottom" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              label="Clear App Cache"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              size="small"
              className="p-button-sm text-xs"
              onClick={handleClearAppCache}
              tooltip="Reset local browser application state"
              tooltipOptions={{ position: "bottom" }}
            />
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Icon icon="tabler:list-details" className="text-cyan-400 text-sm" />
              Media Storage Breakdown
            </span>
            <span className="p-input-icon-left w-48 sm:w-64">
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Filter videos..."
                className="p-inputtext-sm w-full text-xs"
              />
            </span>
          </div>

          <DataTable
            value={videoList}
            selection={selectedVideos}
            onSelectionChange={(e: any) => setSelectedVideos(e.value)}
            selectionMode="checkbox"
            dataKey="id"
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 20]}
            size="small"
            stripedRows
            filters={filters}
            globalFilterFields={["fullTitle", "url", "format", "resolution", "downloadStatus"]}
            className="text-xs rounded-lg overflow-hidden border border-gray-800"
            emptyMessage="No downloads found in your library."
          >
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
            <Column
              field="fullTitle"
              header="Title"
              sortable
              body={(row: VideoT) => (
                <span className="font-medium text-gray-100 truncate max-w-[180px] sm:max-w-xs block" title={row.fullTitle || row.url}>
                  {row.fullTitle || row.url}
                </span>
              )}
            />
            <Column
              field="downloadStatus"
              header="Status"
              sortable
              body={(row: VideoT) => (
                <Tag
                  value={row.downloadStatus.toUpperCase()}
                  severity={
                    row.downloadStatus === "completed"
                      ? "success"
                      : row.downloadStatus === "downloading"
                      ? "info"
                      : "danger"
                  }
                  className="text-black text-[9px] font-mono px-1 py-0.5"
                />
              )}
            />
            <Column
              field="watched"
              header="Watched"
              sortable
              body={(row: VideoT) => (
                <Tag
                  value={row.watched ? "WATCHED" : "UNWATCHED"}
                  severity={row.watched ? "info" : "secondary"}
                  className="text-black text-[9px] font-mono px-1 py-0.5"
                />
              )}
            />
            <Column
              field="size"
              header="Disk Size"
              sortable
              body={(row: VideoT) => (
                <span className="font-mono font-bold text-amber-400 text-xs">
                  {row.size || "0 B"}
                </span>
              )}
            />
            <Column
              header="Actions"
              body={(row: VideoT) => (
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  className="p-button-sm py-1 px-2 border-0"
                  onClick={async () => {
                    if (confirm(`Purge '${row.fullTitle || row.url}'?`)) {
                      await bulkCleanUserStorage({ video_ids: [row.id] });
                      toast.current?.show({
                        severity: "success",
                        summary: "Video Purged",
                        detail: `Purged '${row.fullTitle || row.url}'`,
                      });
                    }
                  }}
                />
              )}
            />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
}
