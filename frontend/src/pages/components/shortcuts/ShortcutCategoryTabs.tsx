import { memo } from "react";

export type ShortcutCategory = "All" | "Navigation" | "Actions" | "Player";

interface ShortcutCategoryTabsProps {
  categories: ShortcutCategory[];
  activeTab: ShortcutCategory;
  onSelectTab: (tab: ShortcutCategory) => void;
}

export const ShortcutCategoryTabs = memo(
  ({ categories, activeTab, onSelectTab }: ShortcutCategoryTabsProps) => {
    return (
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-900/80 rounded-xl border border-gray-200 dark:border-zinc-800 self-stretch sm:self-auto overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectTab(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all border-0 cursor-pointer ${
              activeTab === cat
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 bg-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  },
);

ShortcutCategoryTabs.displayName = "ShortcutCategoryTabs";
