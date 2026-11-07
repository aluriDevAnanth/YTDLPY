import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StorageFileCookiesBanner } from "src/pages/components/settings/cookies/StorageFileCookiesBanner";

const datasets = Array.from({ length: 10 }, (_, i) => ({
  datasetId: i + 1,
}));

describe("StorageFileCookiesBanner Unit Tests with 10 Datasets", () => {
  datasets.forEach(({ datasetId }) => {
    it(`dataset #${datasetId}: should render backend file mode info and cookies.txt path`, () => {
      render(<StorageFileCookiesBanner />);
      expect(screen.getByText("Backend File Mode:")).toBeInTheDocument();
      expect(screen.getByText("storage/cookies.txt")).toBeInTheDocument();
    });
  });
});
