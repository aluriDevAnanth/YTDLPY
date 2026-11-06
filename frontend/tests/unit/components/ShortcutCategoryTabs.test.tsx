import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ShortcutCategoryTabs, type ShortcutCategory } from "src/pages/components/shortcuts/ShortcutCategoryTabs";

const allCategories: ShortcutCategory[] = ["All", "Navigation", "Actions", "Player"];

const datasets: Array<{ categories: ShortcutCategory[]; activeTab: ShortcutCategory; clickTarget: ShortcutCategory }> = [
  { categories: allCategories, activeTab: "All", clickTarget: "Navigation" },
  { categories: allCategories, activeTab: "Navigation", clickTarget: "Actions" },
  { categories: allCategories, activeTab: "Actions", clickTarget: "Player" },
  { categories: allCategories, activeTab: "Player", clickTarget: "All" },
  { categories: ["All", "Player"], activeTab: "All", clickTarget: "Player" },
  { categories: ["Navigation", "Actions"], activeTab: "Navigation", clickTarget: "Actions" },
  { categories: allCategories, activeTab: "Actions", clickTarget: "Actions" },
  { categories: allCategories, activeTab: "Player", clickTarget: "Navigation" },
  { categories: ["All", "Actions", "Player"], activeTab: "Actions", clickTarget: "All" },
  { categories: allCategories, activeTab: "All", clickTarget: "Player" },
];

describe("ShortcutCategoryTabs Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render tabs and handle category selection (${data.activeTab} -> ${data.clickTarget})`, () => {
      const handleSelect = vi.fn();
      render(
        <ShortcutCategoryTabs
          categories={data.categories}
          activeTab={data.activeTab}
          onSelectTab={handleSelect}
        />
      );

      data.categories.forEach((cat) => {
        expect(screen.getByText(cat)).toBeInTheDocument();
      });

      const buttonToClick = screen.getByRole("button", { name: data.clickTarget });
      fireEvent.click(buttonToClick);
      expect(handleSelect).toHaveBeenCalledWith(data.clickTarget);
    });
  });
});
