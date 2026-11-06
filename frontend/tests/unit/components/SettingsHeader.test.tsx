import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsHeader } from "src/pages/components/settings/SettingsHeader";

const datasets = [
  { isAdmin: false, expectedSub: "Configure your personal download defaults, layout, and authentication cookies" },
  { isAdmin: true, expectedSub: "Configure global defaults for all users, download quality, and multi-browser cookies" },
  { isAdmin: false, expectedSub: "Configure your personal download defaults, layout, and authentication cookies" },
  { isAdmin: true, expectedSub: "Configure global defaults for all users, download quality, and multi-browser cookies" },
  { isAdmin: false, expectedSub: "Configure your personal download defaults, layout, and authentication cookies" },
  { isAdmin: true, expectedSub: "Configure global defaults for all users, download quality, and multi-browser cookies" },
  { isAdmin: false, expectedSub: "Configure your personal download defaults, layout, and authentication cookies" },
  { isAdmin: true, expectedSub: "Configure global defaults for all users, download quality, and multi-browser cookies" },
  { isAdmin: false, expectedSub: "Configure your personal download defaults, layout, and authentication cookies" },
  { isAdmin: true, expectedSub: "Configure global defaults for all users, download quality, and multi-browser cookies" },
];

describe("SettingsHeader Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render header for admin=${data.isAdmin}`, () => {
      render(<SettingsHeader isAdmin={data.isAdmin} />);
      expect(screen.getByText(/User Preferences & Settings/i)).toBeInTheDocument();
      expect(screen.getByText(data.expectedSub)).toBeInTheDocument();
      if (data.isAdmin) {
        expect(screen.getByText("ADMIN GLOBAL DEFAULTS")).toBeInTheDocument();
      } else {
        expect(screen.queryByText("ADMIN GLOBAL DEFAULTS")).not.toBeInTheDocument();
      }
    });
  });
});
