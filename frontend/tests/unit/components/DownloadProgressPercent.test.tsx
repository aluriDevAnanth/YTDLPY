import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DownloadProgressPercent } from "src/pages/components/download/DownloadProgressPercent";

const datasets = [
  { percent: 0, expected: "0%" },
  { percent: 5, expected: "5%" },
  { percent: 18, expected: "18%" },
  { percent: 33, expected: "33%" },
  { percent: 50, expected: "50%" },
  { percent: 67, expected: "67%" },
  { percent: 85, expected: "85%" },
  { percent: 99, expected: "99%" },
  { percent: 100, expected: "100%" },
  { percent: -1, expected: "0%" },
];

describe("DownloadProgressPercent Unit Tests with 10 Datasets", () => {
  datasets.forEach(({ percent, expected }, index) => {
    it(`dataset #${index}: should display correct percent string (${percent} -> ${expected})`, () => {
      render(<DownloadProgressPercent displayPercent={percent} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
