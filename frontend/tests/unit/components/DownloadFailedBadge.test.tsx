import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DownloadFailedBadge } from "src/pages/components/download/DownloadFailedBadge";

const retryDatasets = Array.from({ length: 10 }, (_, i) => ({
  datasetId: i + 1,
  retryClickCount: (i % 3) + 1,
}));

describe("DownloadFailedBadge Unit Tests with 10 Datasets", () => {
  retryDatasets.forEach(({ datasetId, retryClickCount }) => {
    it(`dataset #${datasetId}: should render Failed status and handle ${retryClickCount} retry clicks`, () => {
      const handleRetry = vi.fn();
      render(<DownloadFailedBadge onRetry={handleRetry} />);

      expect(screen.getByText("Failed")).toBeInTheDocument();
      const retryBtn = screen.getByTitle("Retry Download");
      expect(retryBtn).toBeInTheDocument();

      for (let c = 0; c < retryClickCount; c++) {
        fireEvent.click(retryBtn);
      }
      expect(handleRetry).toHaveBeenCalledTimes(retryClickCount);
    });
  });
});
