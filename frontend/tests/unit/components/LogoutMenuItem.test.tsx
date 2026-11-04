import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LogoutMenuItem } from "src/pages/components/header/LogoutMenuItem";

const datasets = Array.from({ length: 10 }, (_, i) => ({
  datasetId: i + 1,
  clickCount: (i % 3) + 1,
}));

describe("LogoutMenuItem Unit Tests with 10 Datasets", () => {
  datasets.forEach(({ datasetId, clickCount }) => {
    it(`dataset #${datasetId}: should render Sign Out item and invoke onLogout ${clickCount} times`, () => {
      const handleLogout = vi.fn();
      render(<LogoutMenuItem onLogout={handleLogout} />);

      const item = screen.getByText("Sign Out");
      expect(item).toBeInTheDocument();

      for (let c = 0; c < clickCount; c++) {
        fireEvent.click(item);
      }
      expect(handleLogout).toHaveBeenCalledTimes(clickCount);
    });
  });
});
