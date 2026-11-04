import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { DownloadStatusBadge } from "src/pages/components/download/DownloadStatusBadge";
import useAppStore from "src/store/useAppStore";
import type { VideoT } from "src/schema";

const datasets: Array<{ rowData: VideoT; percent: number; expectedText: string }> = [
  {
    rowData: { id: "vid_completed_1", title: "Finished Video 1", duration: 120, thumbnail: "", downloadStatus: "completed", url: "https://example.com/1" },
    percent: 100,
    expectedText: "vid_completed_1",
  },
  {
    rowData: { id: "vid_completed_2", title: "Finished Video 2", duration: 300, thumbnail: "", downloadStatus: "completed", url: "https://example.com/2" },
    percent: 100,
    expectedText: "vid_completed_2",
  },
  {
    rowData: { id: "vid_sprites_1", title: "Preview Gen 1", duration: 60, thumbnail: "", downloadStatus: "generating_sprites", url: "https://example.com/3" },
    percent: 75,
    expectedText: "Generating preview",
  },
  {
    rowData: { id: "vid_sprites_2", title: "Preview Gen 2", duration: 90, thumbnail: "", downloadStatus: "generating_sprites", url: "https://example.com/4" },
    percent: 90,
    expectedText: "Generating preview",
  },
  {
    rowData: { id: "vid_bundle_1", title: "Packing 1", duration: 180, thumbnail: "", downloadStatus: "packing_bundle", url: "https://example.com/5" },
    percent: 95,
    expectedText: "Packing container",
  },
  {
    rowData: { id: "vid_bundle_2", title: "Packing 2", duration: 240, thumbnail: "", downloadStatus: "packing_bundle", url: "https://example.com/6" },
    percent: 98,
    expectedText: "Packing container",
  },
  {
    rowData: { id: "vid_failed_1", title: "Error Video 1", duration: 45, thumbnail: "", downloadStatus: "failed", url: "https://example.com/7" },
    percent: 15,
    expectedText: "Failed",
  },
  {
    rowData: { id: "vid_failed_2", title: "Error Video 2", duration: 100, thumbnail: "", downloadStatus: "failed", url: "https://example.com/8" },
    percent: 40,
    expectedText: "Failed",
  },
  {
    rowData: { id: "vid_completed_3", title: "Finished Video 3", duration: 600, thumbnail: "", downloadStatus: "completed", url: "https://example.com/9" },
    percent: 100,
    expectedText: "vid_completed_3",
  },
  {
    rowData: { id: "vid_sprites_3", title: "Preview Gen 3", duration: 500, thumbnail: "", downloadStatus: "generating_sprites", url: "https://example.com/10" },
    percent: 50,
    expectedText: "Generating preview",
  },
];

describe("DownloadStatusBadge Unit Tests with 10 Datasets", () => {
  beforeEach(() => {
    useAppStore.setState({ videos: [] });
  });

  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render correct badge for status '${data.rowData.downloadStatus}'`, () => {
      render(<DownloadStatusBadge rowData={data.rowData} displayPercent={data.percent} />);
      expect(screen.getByText(data.expectedText)).toBeInTheDocument();
    });
  });
});
