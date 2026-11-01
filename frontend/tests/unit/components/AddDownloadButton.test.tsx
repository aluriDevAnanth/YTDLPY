import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AddDownloadButton } from "src/pages/components/header/AddDownloadButton";

const datasets: Array<{ isMac?: boolean; isMobile?: boolean; clickTimes: number }> = [
  { isMac: false, isMobile: false, clickTimes: 1 },
  { isMac: true, isMobile: false, clickTimes: 1 },
  { isMac: false, isMobile: true, clickTimes: 1 },
  { isMac: true, isMobile: true, clickTimes: 1 },
  { isMac: false, isMobile: false, clickTimes: 2 },
  { isMac: true, isMobile: false, clickTimes: 2 },
  { isMac: false, isMobile: true, clickTimes: 3 },
  { isMac: true, isMobile: true, clickTimes: 3 },
  { isMac: false, isMobile: false, clickTimes: 5 },
  { isMac: true, isMobile: false, clickTimes: 5 },
];

describe("AddDownloadButton Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render add button and handle ${data.clickTimes} clicks (Mac: ${data.isMac}, Mobile: ${data.isMobile})`, () => {
      const handleClick = vi.fn();
      render(
        <AddDownloadButton
          onClick={handleClick}
          isMac={data.isMac}
          isMobile={data.isMobile}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      for (let c = 0; c < data.clickTimes; c++) {
        fireEvent.click(button);
      }
      expect(handleClick).toHaveBeenCalledTimes(data.clickTimes);
    });
  });
});
