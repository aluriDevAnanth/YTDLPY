import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CompletedMetricCard } from "src/pages/components/admin/metrics/CompletedMetricCard";

const datasets = [
  { completed: 0, label: "0" },
  { completed: 1, label: "1" },
  { completed: 42, label: "42" },
  { completed: 100, label: "100" },
  { completed: 999, label: "999" },
  { completed: 1024, label: "1024" },
  { completed: 5000, label: "5000" },
  { completed: 12345, label: "12345" },
  { completed: 999999, label: "999999" },
  { completed: 1000000, label: "1000000" },
];

describe("CompletedMetricCard Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render completed metric count correctly (${data.completed})`, () => {
      render(<CompletedMetricCard completedDownloads={data.completed} />);
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText(data.label)).toBeInTheDocument();
    });
  });
});
