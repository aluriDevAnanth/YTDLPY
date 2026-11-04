import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DownloadPreviewBadge } from "src/pages/components/download/DownloadPreviewBadge";

const datasets = [
  { percent: 0, expected: "0%" },
  { percent: 8, expected: "8%" },
  { percent: 20, expected: "20%" },
  { percent: 35, expected: "35%" },
  { percent: 50, expected: "50%" },
  { percent: 65, expected: "65%" },
  { percent: 80, expected: "80%" },
  { percent: 92, expected: "92%" },
  { percent: 99, expected: "99%" },
  { percent: 100, expected: "100%" },
];

describe("DownloadPreviewBadge Unit Tests with 10 Datasets", () => {
  datasets.forEach(({ percent, expected }, index) => {
    it(`dataset #${index}: should render Generating preview with percent ${percent}`, () => {
      render(<DownloadPreviewBadge displayPercent={percent} />);
      expect(screen.getByText("Generating preview")).toBeInTheDocument();
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
