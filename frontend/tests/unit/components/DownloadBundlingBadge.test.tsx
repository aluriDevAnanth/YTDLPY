import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DownloadBundlingBadge } from "src/pages/components/download/DownloadBundlingBadge";

const datasets = [
  { percent: 0, expected: "99%" },
  { percent: 10, expected: "10%" },
  { percent: 25, expected: "25%" },
  { percent: 45, expected: "45%" },
  { percent: 60, expected: "60%" },
  { percent: 75, expected: "75%" },
  { percent: 88, expected: "88%" },
  { percent: 95, expected: "95%" },
  { percent: 99, expected: "99%" },
  { percent: 100, expected: "100%" },
];

describe("DownloadBundlingBadge Unit Tests with 10 Datasets", () => {
  datasets.forEach(({ percent, expected }, index) => {
    it(`dataset #${index}: should render packing container badge with percent ${percent}`, () => {
      render(<DownloadBundlingBadge displayPercent={percent} />);
      expect(screen.getByText("Packing container")).toBeInTheDocument();
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
