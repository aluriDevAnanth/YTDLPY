import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AdminBanner } from "src/pages/components/settings/AdminBanner";

const datasets = [
  { isAdmin: false, applyingAll: false, shouldRender: false },
  { isAdmin: true, applyingAll: false, shouldRender: true },
  { isAdmin: true, applyingAll: true, shouldRender: true },
  { isAdmin: false, applyingAll: true, shouldRender: false },
  { isAdmin: true, applyingAll: false, shouldRender: true },
  { isAdmin: true, applyingAll: false, shouldRender: true },
  { isAdmin: false, applyingAll: false, shouldRender: false },
  { isAdmin: true, applyingAll: true, shouldRender: true },
  { isAdmin: false, applyingAll: false, shouldRender: false },
  { isAdmin: true, applyingAll: false, shouldRender: true },
];

describe("AdminBanner Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render AdminBanner correctly (Admin: ${data.isAdmin}, Applying: ${data.applyingAll})`, () => {
      const handleApply = vi.fn();
      render(
        <AdminBanner
          isAdmin={data.isAdmin}
          applyingAll={data.applyingAll}
          onApplyToAllUsers={handleApply}
        />
      );

      if (data.shouldRender) {
        expect(screen.getByText("Admin Mode:")).toBeInTheDocument();
        const button = screen.getByRole("button", { name: /Apply to All Users/i });
        expect(button).toBeInTheDocument();
        fireEvent.click(button);
        if (data.applyingAll) {
          // PrimeReact Button is disabled when loading is true
          expect(button).toBeDisabled();
        } else {
          expect(handleApply).toHaveBeenCalled();
        }
      } else {
        expect(screen.queryByText("Admin Mode:")).not.toBeInTheDocument();
      }
    });
  });
});
