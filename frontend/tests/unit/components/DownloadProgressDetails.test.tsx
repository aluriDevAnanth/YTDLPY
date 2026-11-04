import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DownloadProgressDetails } from "src/pages/components/download/DownloadProgressDetails";
import type { VideoProgressT } from "src/schema";

const datasets: VideoProgressT[] = [
  { downloadedSize: "512KB / 10MB", speed: "1.2MB/s", eta: "00:08" },
  { downloadedSize: "1.5MB / 20MB", speed: "2.5MB/s", eta: "00:07" },
  { downloadedSize: "5.0MB / 50MB", speed: "4.8MB/s", eta: "00:09" },
  { downloadedSize: "12.0MB / 60MB", speed: "6.0MB/s", eta: "00:08" },
  { downloadedSize: "25.0MB / 100MB", speed: "10.5MB/s", eta: "00:07" },
  { downloadedSize: "50.0MB / 100MB", speed: "12.0MB/s", eta: "00:04" },
  { downloadedSize: "80.0MB / 100MB", speed: "15.2MB/s", eta: "00:01" },
  { downloadedSize: "95.0MB / 100MB", speed: "18.0MB/s", eta: "00:00" },
  { downloadedSize: "500MB / 1.0GB", speed: "25.0MB/s", eta: "00:20" },
  { downloadedSize: "1.8GB / 2.0GB", speed: "40.0MB/s", eta: "00:05" },
];

describe("DownloadProgressDetails Unit Tests with 10 Datasets", () => {
  datasets.forEach((progress, index) => {
    it(`dataset #${index}: should display downloaded size, speed, and ETA correctly`, () => {
      render(<DownloadProgressDetails progress={progress} />);
      expect(screen.getByText(progress.downloadedSize)).toBeInTheDocument();
      expect(screen.getByText(progress.speed)).toBeInTheDocument();
      expect(screen.getByText(progress.eta)).toBeInTheDocument();
    });
  });
});
