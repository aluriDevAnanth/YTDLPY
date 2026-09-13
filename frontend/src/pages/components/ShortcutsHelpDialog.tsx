import { Icon } from "@iconify/react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useAppStore } from "src/store/useAppStore";

interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Navigation" | "Actions" | "Player";
  badge?: string;
}

const SHORTCUTS_DATA: ShortcutItem[] = [
  // Navigation
  {
    keys: ["Alt", "H"],
    description: "Go to Home / All Downloads",
    category: "Navigation",
  },
  {
    keys: ["Alt", "W"],
    description: "Go to Watch Later",
    category: "Navigation",
  },
  {
    keys: ["Alt", "P"],
    description: "Open Playlists Manager / Studio",
    category: "Navigation",
  },
  {
    keys: ["Alt", "M"],
    description: "Open Storage & Cleanup Manager",
    category: "Navigation",
  },
  {
    keys: ["Alt", "A"],
    description: "Open Admin Dashboard (Admins)",
    category: "Navigation",
    badge: "Admin",
  },

  // Actions
  {
    keys: ["Ctrl", "N"],
    description: "Add New Video Download",
    category: "Actions",
    badge: "Global",
  },
  {
    keys: ["Ctrl", "K"],
    description: "Focus Global Search Bar",
    category: "Actions",
  },
  {
    keys: ["/"],
    description: "Quick Search Bar Focus",
    category: "Actions",
  },
  {
    keys: ["Ctrl", ","],
    description: "Open Settings Dialog",
    category: "Actions",
  },
  {
    keys: ["Alt", "S"],
    description: "Alternate Settings Shortcut",
    category: "Actions",
  },
  {
    keys: ["Alt", "V"],
    description: "Toggle Grid / Table View Mode",
    category: "Actions",
  },
  {
    keys: ["V"],
    description: "Quick View Switch (when not typing)",
    category: "Actions",
  },
  {
    keys: ["Alt", "T"],
    description: "Toggle Dark / Light Theme",
    category: "Actions",
  },
  {
    keys: ["Alt", "R"],
    description: "Refresh Downloads & Playlists",
    category: "Actions",
  },
  {
    keys: ["?"],
    description: "Open this Keyboard Shortcuts Cheat Sheet",
    category: "Actions",
  },
  {
    keys: ["Esc"],
    description: "Close Open Dialogs / Clear Search Focus",
    category: "Actions",
  },

  // Player
  {
    keys: ["Space"],
    description: "Play / Pause Video",
    category: "Player",
  },
  {
    keys: ["K"],
    description: "Alternate Play / Pause",
    category: "Player",
  },
  {
    keys: ["F"],
    description: "Toggle Fullscreen Mode",
    category: "Player",
  },
  {
    keys: ["M"],
    description: "Mute / Unmute Audio",
    category: "Player",
  },
  {
    keys: ["←"],
    description: "Seek Backward 5 Seconds",
    category: "Player",
  },
  {
    keys: ["→"],
    description: "Seek Forward 5 Seconds",
    category: "Player",
  },
  {
    keys: ["J"],
    description: "Seek Backward 10 Seconds",
    category: "Player",
  },
  {
    keys: ["L"],
    description: "Seek Forward 10 Seconds",
    category: "Player",
  },
  {
    keys: ["↑"],
    description: "Volume Up (+10%)",
    category: "Player",
  },
  {
    keys: ["↓"],
    description: "Volume Down (-10%)",
    category: "Player",
  },
  {
    keys: ["<", ">"],
    description: "Decrease / Increase Playback Speed",
    category: "Player",
  },
  {
    keys: ["0", "–", "9"],
    description: "Jump to 0% – 90% of Video Timeline",
    category: "Player",
  },
  {
    keys: ["W"],
    description: "Toggle Watch Later for Active Video",
    category: "Player",
  },
  {
    keys: ["Esc"],
    description: "Exit Video Player",
    category: "Player",
  },
];

export default function ShortcutsHelpDialog() {
  const isShortcutsHelpOpen = useAppStore((state) => state.isShortcutsHelpOpen);
  const setShortcutsHelpOpen = useAppStore((state) => state.setShortcutsHelpOpen);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Navigation" | "Actions" | "Player">("All");

  const isMac = typeof navigator !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0;

  const filteredShortcuts = SHORTCUTS_DATA.filter((s) => {
    const matchesTab = activeTab === "All" || s.category === activeTab;
    const matchesQuery =
      filterQuery === "" ||
      s.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.keys.some((k) => k.toLowerCase().includes(filterQuery.toLowerCase())) ||
      s.category.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const categories: Array<"All" | "Navigation" | "Actions" | "Player"> = ["All", "Actions", "Navigation", "Player"];

  return (
    <Dialog
      visible={isShortcutsHelpOpen}
      onHide={() => setShortcutsHelpOpen(false)}
      header={
        <div className="flex items-center justify-between w-full pr-6 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Icon icon="tabler:keyboard" className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                Keyboard Shortcuts
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Cheat Sheet
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Navigate and control YTDLP-PY-GUI at lightning speed
              </p>
            </div>
          </div>
        </div>
      }
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

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-900/80 rounded-xl border border-gray-200 dark:border-zinc-800 self-stretch sm:self-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
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
        </div>

        {/* Shortcuts List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
          {filteredShortcuts.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-500">
              <Icon icon="tabler:keyboard-off" className="text-3xl mb-2 opacity-50" />
              <p className="text-sm font-medium">No shortcuts found matching &quot;{filterQuery}&quot;</p>
            </div>
          ) : (
            filteredShortcuts.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-bold">
                      {item.category}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Keycaps Container */}
                <div className="flex items-center gap-1 shrink-0">
                  {item.keys.map((k, kIdx) => {
                    const displayKey = k === "Ctrl" && isMac ? "⌘" : k === "Alt" && isMac ? "⌥" : k;
                    return (
                      <span key={kIdx} className="flex items-center gap-1">
                        <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-bold text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm shadow-black/10 dark:shadow-black/40 select-none">
                          {displayKey}
                        </kbd>
                        {kIdx < item.keys.length - 1 && item.keys[kIdx + 1] !== "–" && item.keys[kIdx] !== "–" && (
                          <span className="text-[10px] text-gray-400 dark:text-zinc-600 font-bold">+</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
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
            Press <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 text-[10px] text-zinc-300">Esc</kbd> to exit
          </span>
        </div>
      </div>
    </Dialog>
  );
}
