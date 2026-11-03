import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CookieInheritBanner } from "src/pages/components/settings/cookies/CookieInheritBanner";

const datasets = [
  { adminDefaultsInfo: null, expectedBrowser: "Auto Multi-Browser" },
  { adminDefaultsInfo: { cookies_browser: "chrome" }, expectedBrowser: "chrome" },
  { adminDefaultsInfo: { cookies_browser: "firefox" }, expectedBrowser: "firefox" },
  { adminDefaultsInfo: { cookies_browser: "edge" }, expectedBrowser: "edge" },
  { adminDefaultsInfo: { cookies_browser: "brave" }, expectedBrowser: "brave" },
  { adminDefaultsInfo: { cookies_browser: "opera" }, expectedBrowser: "opera" },
  { adminDefaultsInfo: { cookies_browser: "safari" }, expectedBrowser: "safari" },
  { adminDefaultsInfo: { cookies_browser: "vivaldi" }, expectedBrowser: "vivaldi" },
  { adminDefaultsInfo: { cookies_browser: "chromium" }, expectedBrowser: "chromium" },
  { adminDefaultsInfo: { cookies_browser: "yandex" }, expectedBrowser: "yandex" },
];

describe("CookieInheritBanner Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should display inheriting administrator defaults with '${data.expectedBrowser}'`, () => {
      render(<CookieInheritBanner adminDefaultsInfo={data.adminDefaultsInfo} />);
      expect(screen.getByText(/Inheriting Administrator Defaults/i)).toBeInTheDocument();
      expect(screen.getByText(data.expectedBrowser)).toBeInTheDocument();
    });
  });
});
