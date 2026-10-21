import { memo } from "react";
import type { UserStorageStats } from "src/store/useAppStore";
import { StorageClearCacheButton } from "./StorageClearCacheButton";
import { StoragePurgeAllButton } from "./StoragePurgeAllButton";
import { StoragePurgeSelectedButton } from "./StoragePurgeSelectedButton";
import { StoragePurgeWatchedButton } from "./StoragePurgeWatchedButton";

interface StorageActionsToolbarProps {
  storageStats: UserStorageStats | null;
  selectedCount: number;
  totalVideosCount: number;
  loading: boolean;
  onCleanWatched: () => void;
  onCleanSelected: () => void;
  onClearAll: () => void;
  onClearAppCache: () => void;
}

export const StorageActionsToolbar = memo(
  ({
    storageStats,
    selectedCount,
    totalVideosCount,
    loading,
    onCleanWatched,
    onCleanSelected,
    onClearAll,
    onClearAppCache,
  }: StorageActionsToolbarProps) => {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-900/40 border border-gray-800">
        <div className="flex items-center gap-2 flex-wrap">
          <StoragePurgeWatchedButton
            watchedCount={storageStats?.watched_videos_count || 0}
            loading={loading}
            onClick={onCleanWatched}
          />
          <StoragePurgeSelectedButton
            selectedCount={selectedCount}
            loading={loading}
            onClick={onCleanSelected}
          />
          <StoragePurgeAllButton
            totalVideosCount={totalVideosCount}
            loading={loading}
            onClick={onClearAll}
          />
        </div>

        <div className="flex items-center gap-2">
          <StorageClearCacheButton onClick={onClearAppCache} />
        </div>
      </div>
    );
  },
);

StorageActionsToolbar.displayName = "StorageActionsToolbar";

export default StorageActionsToolbar;
