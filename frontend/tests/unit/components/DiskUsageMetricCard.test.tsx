import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DiskUsageMetricCard } from "src/pages/components/admin/metrics/DiskUsageMetricCard";

const datasets = [
  "0 MiB",
  "12.5 MiB",
  "512 MiB",
  "1.02 GiB",
  "4.75 GiB",
  "16.00 GiB",
  "128.45 GiB",
  "1.20 TiB",
  "5.80 TiB",
  "10.00 TiB",
];

describe("DiskUsageMetricCard Unit Tests with 10 Datasets", () => {
  datasets.forEach((storageStr, index) => {
    it(`dataset #${index}: should render formatted disk usage correctly (${storageStr})`, () => {
      render(<DiskUsageMetricCard formattedStorage={storageStr} />);
      expect(screen.getByText("Disk Usage")).toBeInTheDocument();
      expect(screen.getByText(storageStr)).toBeInTheDocument();
    });
  });
});
