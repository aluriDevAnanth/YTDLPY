import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UsersMetricCard } from "src/pages/components/admin/metrics/UsersMetricCard";

// Note: UsersMetricCard displays Math.max(0, totalUsers - 1) to exclude default admin
const datasets = [
  { total: 0, expected: "0" },
  { total: 1, expected: "0" },
  { total: 2, expected: "1" },
  { total: 5, expected: "4" },
  { total: 10, expected: "9" },
  { total: 50, expected: "49" },
  { total: 100, expected: "99" },
  { total: 250, expected: "249" },
  { total: 1000, expected: "999" },
  { total: 5000, expected: "4999" },
];

describe("UsersMetricCard Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render non-admin users count correctly (input: ${data.total} -> ${data.expected})`, () => {
      render(<UsersMetricCard totalUsers={data.total} />);
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText(data.expected)).toBeInTheDocument();
    });
  });
});
