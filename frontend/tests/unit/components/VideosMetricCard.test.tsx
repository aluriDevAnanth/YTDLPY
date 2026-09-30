import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VideosMetricCard } from "src/pages/components/admin/metrics/VideosMetricCard";

const datasets = [
  { total: 0, expected: "0" },
  { total: 1, expected: "1" },
  { total: 17, expected: "17" },
  { total: 55, expected: "55" },
  { total: 128, expected: "128" },
  { total: 500, expected: "500" },
  { total: 1024, expected: "1024" },
  { total: 7500, expected: "7500" },
  { total: 99999, expected: "99999" },
  { total: 1000000, expected: "1000000" },
];

describe("VideosMetricCard Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render total videos count correctly (${data.expected})`, () => {
      render(<VideosMetricCard totalVideos={data.total} />);
      expect(screen.getByText("Videos")).toBeInTheDocument();
      expect(screen.getByText(data.expected)).toBeInTheDocument();
    });
  });
});
