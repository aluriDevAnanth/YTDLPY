import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SettingsFooter } from "src/pages/components/settings/SettingsFooter";

const datasets = [
  { loading: false, cancelClicks: 1, saveClicks: 1 },
  { loading: true, cancelClicks: 1, saveClicks: 0 },
  { loading: false, cancelClicks: 2, saveClicks: 1 },
  { loading: false, cancelClicks: 0, saveClicks: 3 },
  { loading: true, cancelClicks: 0, saveClicks: 0 },
  { loading: false, cancelClicks: 1, saveClicks: 2 },
  { loading: false, cancelClicks: 3, saveClicks: 1 },
  { loading: true, cancelClicks: 1, saveClicks: 0 },
  { loading: false, cancelClicks: 2, saveClicks: 2 },
  { loading: false, cancelClicks: 0, saveClicks: 4 },
];

describe("SettingsFooter Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render footer actions and handle clicks (Loading: ${data.loading})`, () => {
      const handleCancel = vi.fn();
      const handleSave = vi.fn();

      render(
        <SettingsFooter
          loading={data.loading}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      );

      const cancelBtn = screen.getByRole("button", { name: "Cancel" });
      const saveBtn = screen.getByRole("button", { name: /Save Settings/i });

      expect(cancelBtn).toBeInTheDocument();
      expect(saveBtn).toBeInTheDocument();

      for (let c = 0; c < data.cancelClicks; c++) {
        fireEvent.click(cancelBtn);
      }
      for (let s = 0; s < data.saveClicks; s++) {
        fireEvent.click(saveBtn);
      }

      expect(handleCancel).toHaveBeenCalledTimes(data.cancelClicks);
      if (!data.loading) {
        expect(handleSave).toHaveBeenCalledTimes(data.saveClicks);
      }
    });
  });
});
