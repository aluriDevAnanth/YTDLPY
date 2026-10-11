import { Icon } from "@iconify/react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useMemo, useState } from "react";
import { useAppStore } from "src/store/useAppStore";
import {
  ShortcutCategoryTabs,
  type ShortcutCategory,
} from "./shortcuts/ShortcutCategoryTabs";
import { ShortcutItemCard } from "./shortcuts/ShortcutItemCard";
import { SHORTCUTS_DATA } from "./shortcuts/shortcutsData";
import { ShortcutsHelpHeader } from "./shortcuts/ShortcutsHelpHeader";

const CATEGORIES: ShortcutCategory[] = ["All", "Actions", "Navigation", "Player"];

export default function ShortcutsHelpDialog() {
  const isShortcutsHelpOpen = useAppStore((state) => state.isShortcutsHelpOpen);
  const setShortcutsHelpOpen = useAppStore(
    (state) => state.setShortcutsHelpOpen,
  );
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ShortcutCategory>("All");

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform?.toUpperCase().indexOf("MAC") >= 0;

  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS_DATA.filter((s) => {
      const matchesTab = activeTab === "All" || s.category === activeTab;
      const matchesQuery =
        filterQuery === "" ||
        s.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
        s.keys.some((k) =>
          k.toLowerCase().includes(filterQuery.toLowerCase()),
        ) ||
        s.category.toLowerCase().includes(filterQuery.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [activeTab, filterQuery]);

  return (
    <Dialog
      visible={isShortcutsHelpOpen}
      onHide={() => setShortcutsHelpOpen(false)}
      header={<ShortcutsHelpHeader />}
      className="w-full max-w-2xl font-sans"
      dismissableMask
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-4 py-1">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Icon
              icon="tabler:search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 text-base"
            />
            <InputText
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-zinc-900/80 border-gray-200 dark:border-zinc-800 rounded-xl focus:border-cyan-500"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 border-0 bg-transparent cursor-pointer p-0"
              >
                <Icon icon="tabler:x" className="text-xs" />
              </button>
            )}
          </div>

          <ShortcutCategoryTabs
            categories={CATEGORIES}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />
        </div>

        {/* Shortcuts List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
          {filteredShortcuts.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-500">
              <Icon
                icon="tabler:keyboard-off"
                className="text-3xl mb-2 opacity-50"
              />
              <p className="text-sm font-medium">
                No shortcuts found matching &quot;{filterQuery}&quot;
              </p>
            </div>
          ) : (
            filteredShortcuts.map((item, idx) => (
              <ShortcutItemCard key={idx} item={item} isMac={isMac} />
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500 pt-2 border-t border-gray-200 dark:border-zinc-800 select-none">
          <span className="flex items-center gap-1.5">
            <Icon icon="tabler:bulb" className="text-amber-400 text-sm" />
            Shortcuts are automatically paused when typing in text fields.
          </span>
          <span className="hidden sm:inline font-mono">
            Press{" "}
            <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 text-[10px] text-zinc-300">
              Esc
            </kbd>{" "}
            to exit
          </span>
        </div>
      </div>
    </Dialog>
  );
}
