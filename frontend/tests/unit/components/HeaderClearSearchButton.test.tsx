import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeaderClearSearchButton } from "src/pages/components/header/HeaderClearSearchButton";

const clickDatasets = Array.from({ length: 10 }, (_, i) => ({
  datasetId: i + 1,
  clickCount: (i % 4) + 1,
}));

describe("HeaderClearSearchButton Unit Tests with 10 Datasets", () => {
  clickDatasets.forEach(({ datasetId, clickCount }) => {
    it(`dataset #${datasetId}: should render clear button and invoke callback on ${clickCount} clicks`, () => {
      const handleClear = vi.fn();
      render(<HeaderClearSearchButton onClear={handleClear} />);

      const button = screen.getByTitle("Clear Search (Esc)");
      expect(button).toBeInTheDocument();

      for (let c = 0; c < clickCount; c++) {
        fireEvent.click(button);
      }
      expect(handleClear).toHaveBeenCalledTimes(clickCount);
    });
  });
});
