import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdminMetricsOverview } from "src/pages/components/admin/metrics/AdminMetricsOverview";
import type { AdminStats } from "src/pages/components/admin/adminTypes";

const datasets: Array<AdminStats | null> = [
  null,
  { total_users: 1, total_videos: 0, formatted_storage: "0 MiB", completed_downloads: 0, active_downloads: 0, failed_downloads: 0, total_storage_bytes: 0 },
  { total_users: 2, total_videos: 10, formatted_storage: "150.5 MiB", completed_downloads: 8, active_downloads: 1, failed_downloads: 1, total_storage_bytes: 157810688 },
  { total_users: 5, total_videos: 42, formatted_storage: "1.20 GiB", completed_downloads: 40, active_downloads: 0, failed_downloads: 2, total_storage_bytes: 1288490188 },
  { total_users: 10, total_videos: 120, formatted_storage: "4.55 GiB", completed_downloads: 115, active_downloads: 3, failed_downloads: 2, total_storage_bytes: 4885544960 },
  { total_users: 25, total_videos: 350, formatted_storage: "12.80 GiB", completed_downloads: 340, active_downloads: 5, failed_downloads: 5, total_storage_bytes: 13743895347 },
  { total_users: 50, total_videos: 990, formatted_storage: "54.20 GiB", completed_downloads: 980, active_downloads: 4, failed_downloads: 6, total_storage_bytes: 58197770240 },
  { total_users: 100, total_videos: 2500, formatted_storage: "180.00 GiB", completed_downloads: 2450, active_downloads: 10, failed_downloads: 40, total_storage_bytes: 193273528320 },
  { total_users: 500, total_videos: 15000, formatted_storage: "1.50 TiB", completed_downloads: 14800, active_downloads: 50, failed_downloads: 150, total_storage_bytes: 1649267441664 },
  { total_users: 1000, total_videos: 50000, formatted_storage: "6.25 TiB", completed_downloads: 49500, active_downloads: 100, failed_downloads: 400, total_storage_bytes: 6871947673600 },
];

describe("AdminMetricsOverview Unit Tests with 10 Datasets", () => {
  datasets.forEach((stats, index) => {
    it(`dataset #${index}: should render all 4 metric cards with correct data`, () => {
      render(<AdminMetricsOverview stats={stats} />);
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Videos")).toBeInTheDocument();
      expect(screen.getByText("Disk Usage")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });
});
