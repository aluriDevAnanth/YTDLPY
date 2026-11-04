import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DownloadProgressBar } from "src/pages/components/download/DownloadProgressBar";
import type { VideoProgressT } from "src/schema";

const datasets: Array<{ progress?: VideoProgressT; percent: number; isStarting: boolean }> = [
  { percent: 0, isStarting: true },
  { percent: 0, isStarting: true },
  { progress: { downloadedSize: "1.2MB", speed: "1.5MB/s", eta: "00:10" }, percent: 12, isStarting: false },
  { progress: { downloadedSize: "5.4MB", speed: "2.1MB/s", eta: "00:08" }, percent: 25, isStarting: false },
  { progress: { downloadedSize: "15.0MB", speed: "5.0MB/s", eta: "00:05" }, percent: 50, isStarting: false },
  { progress: { downloadedSize: "32.8MB", speed: "8.2MB/s", eta: "00:03" }, percent: 75, isStarting: false },
  { progress: { downloadedSize: "48.2MB", speed: "10.1MB/s", eta: "00:01" }, percent: 90, isStarting: false },
  { progress: { downloadedSize: "55.0MB", speed: "12.0MB/s", eta: "00:00" }, percent: 99, isStarting: false },
  { progress: { downloadedSize: "100.0MB", speed: "25.0MB/s", eta: "00:00" }, percent: 100, isStarting: false },
  { percent: 5, isStarting: true },
];

describe("DownloadProgressBar Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render download progress correctly (Starting: ${data.isStarting}, Percent: ${data.percent})`, () => {
      render(<DownloadProgressBar progress={data.progress} displayPercent={data.percent} />);
      if (data.isStarting) {
        expect(screen.getByText("Starting download...")).toBeInTheDocument();
      } else {
        expect(screen.getByText(data.progress!.downloadedSize)).toBeInTheDocument();
        expect(screen.getByText(data.progress!.speed)).toBeInTheDocument();
        expect(screen.getByText(data.progress!.eta)).toBeInTheDocument();
      }
    });
  });
});
