import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ViewModeToggle } from "src/pages/components/header/ViewModeToggle";

const datasets: Array<{ viewMode: "table" | "grid"; isMac?: boolean; isMobile?: boolean }> = [
  { viewMode: "table", isMac: false, isMobile: false },
  { viewMode: "grid", isMac: false, isMobile: false },
  { viewMode: "table", isMac: true, isMobile: false },
  { viewMode: "grid", isMac: true, isMobile: false },
  { viewMode: "table", isMac: false, isMobile: true },
  { viewMode: "grid", isMac: false, isMobile: true },
  { viewMode: "table", isMac: true, isMobile: true },
  { viewMode: "grid", isMac: true, isMobile: true },
  { viewMode: "table", isMac: false, isMobile: false },
  { viewMode: "grid", isMac: true, isMobile: false },
];

describe("ViewModeToggle Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should toggle view mode correctly (Mode: ${data.viewMode}, Mac: ${data.isMac}, Mobile: ${data.isMobile})`, () => {
      const handleToggle = vi.fn();
      render(
        <ViewModeToggle
          viewMode={data.viewMode}
          onToggleViewMode={handleToggle}
          isMac={data.isMac}
          isMobile={data.isMobile}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });
  });
});
