import type { AdminStats } from "../adminTypes";
import { CompletedMetricCard } from "./CompletedMetricCard";
import { DiskUsageMetricCard } from "./DiskUsageMetricCard";
import { UsersMetricCard } from "./UsersMetricCard";
import { VideosMetricCard } from "./VideosMetricCard";

interface AdminMetricsOverviewProps {
  stats: AdminStats | null;
}

export function AdminMetricsOverview({ stats }: AdminMetricsOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <UsersMetricCard totalUsers={stats?.total_users} />
      <VideosMetricCard totalVideos={stats?.total_videos} />
      <DiskUsageMetricCard formattedStorage={stats?.formatted_storage} />
      <CompletedMetricCard completedDownloads={stats?.completed_downloads} />
    </div>
  );
}

export default AdminMetricsOverview;
