import { memo } from "react";
import { KeyBadge } from "./KeyBadge";
import type { ShortcutItem } from "./shortcutsData";

interface ShortcutItemCardProps {
  item: ShortcutItem;
  isMac?: boolean;
}

export const ShortcutItemCard = memo(
  ({ item, isMac }: ShortcutItemCardProps) => {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 hover:border-cyan-500/30 transition-colors">
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

        <KeyBadge keys={item.keys} isMac={isMac} />
      </div>
    );
  },
);

ShortcutItemCard.displayName = "ShortcutItemCard";
