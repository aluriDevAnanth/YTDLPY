import { memo } from "react";
import type { UserStorageStats } from "src/store/useAppStore";
import { LargestFileCard } from "./LargestFileCard";
import { LibraryCountCard } from "./LibraryCountCard";
import { TotalDiskCard } from "./TotalDiskCard";
import { WatchedSpaceCard } from "./WatchedSpaceCard";

interface StorageStatsCardsProps {
  storageStats: UserStorageStats | null;
}

export const StorageStatsCards = memo(
  ({ storageStats }: StorageStatsCardsProps) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <TotalDiskCard
          formattedBytes={storageStats?.formatted_bytes}
          completedDownloads={storageStats?.completed_downloads}
        />
        <WatchedSpaceCard
          formattedWatchedBytes={storageStats?.formatted_watched_bytes}
          watchedVideosCount={storageStats?.watched_videos_count}
        />
        <LargestFileCard
          formattedLargestBytes={storageStats?.formatted_largest_bytes}
          largestVideoTitle={storageStats?.largest_video_title || undefined}
        />
        <LibraryCountCard totalVideos={storageStats?.total_videos} />
      </div>
    );
  },
);

StorageStatsCards.displayName = "StorageStatsCards";

export default StorageStatsCards;
