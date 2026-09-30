import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { VideoIdCopyButton } from "src/pages/components/download/VideoIdCopyButton";

const datasets = [
  "vid_001_abc",
  "vid_002_def",
  "dQw4w9WgXcQ",
  "kln3480_short",
  "long_video_id_hash_1234567890",
  "test_item_9999",
  "bundle_xyz_456",
  "yt_xXx_stream",
  "clip_9876543210",
  "media_id_final_10",
];

describe("VideoIdCopyButton Unit Tests with 10 Datasets", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  datasets.forEach((videoId, index) => {
    it(`dataset #${index}: should render video ID ${videoId} and handle copy click`, async () => {
      render(<VideoIdCopyButton id={videoId} />);
      expect(screen.getByText(videoId)).toBeInTheDocument();
      expect(screen.getByText("Copy")).toBeInTheDocument();

      const copyBtn = screen.getByText("Copy");
      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(videoId);
      expect(screen.getByText("Copied")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1100);
      });
      expect(screen.getByText("Copy")).toBeInTheDocument();
    });
  });
});
