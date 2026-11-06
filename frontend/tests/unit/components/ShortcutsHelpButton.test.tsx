import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ShortcutsHelpButton } from "src/pages/components/header/ShortcutsHelpButton";

const datasets = Array.from({ length: 10 }, (_, i) => ({
  datasetId: i + 1,
  clickCount: (i % 3) + 1,
}));

describe("ShortcutsHelpButton Unit Tests with 10 Datasets", () => {
  datasets.forEach(({ datasetId, clickCount }) => {
    it(`dataset #${datasetId}: should render help button and invoke onClick ${clickCount} times`, () => {
      const handleClick = vi.fn();
      render(<ShortcutsHelpButton onClick={handleClick} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      for (let c = 0; c < clickCount; c++) {
        fireEvent.click(button);
      }
      expect(handleClick).toHaveBeenCalledTimes(clickCount);
    });
  });
});
