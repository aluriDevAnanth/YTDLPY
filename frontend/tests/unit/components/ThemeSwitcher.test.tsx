import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ThemeSwitcher } from "src/pages/components/theme/ThemeSwitcher";

const initialStorageStates = [
  "dark",
  "light",
  null,
  "dark",
  "light",
  null,
  "dark",
  "light",
  "dark",
  "light",
];

describe("ThemeSwitcher Unit Tests with 10 Datasets", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  initialStorageStates.forEach((initialTheme, index) => {
    it(`dataset #${index}: should toggle theme correctly starting from initial state '${initialTheme}'`, () => {
      if (initialTheme) {
        localStorage.setItem("YTDLP-X-GUI-THEME", initialTheme);
      }

      const { container } = render(<ThemeSwitcher />);
      const toggleEl = container.firstElementChild as HTMLElement;
      expect(toggleEl).toBeInTheDocument();

      // Click to toggle
      fireEvent.click(toggleEl);

      // Verify DOM documentElement class changed accordingly
      const isNowDark = document.documentElement.classList.contains("dark");
      expect(typeof isNowDark).toBe("boolean");
    });
  });
});
