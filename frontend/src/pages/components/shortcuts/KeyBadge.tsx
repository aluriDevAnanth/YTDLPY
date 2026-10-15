import { memo } from "react";

interface KeyBadgeProps {
  keys: string[];
  isMac?: boolean;
}

export const KeyBadge = memo(({ keys, isMac }: KeyBadgeProps) => {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {keys.map((k, kIdx) => {
        const displayKey =
          k === "Ctrl" && isMac ? "⌘" : k === "Alt" && isMac ? "⌥" : k;
        return (
          <span key={kIdx} className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-bold text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm shadow-black/10 dark:shadow-black/40 select-none">
              {displayKey}
            </kbd>
            {kIdx < keys.length - 1 &&
              keys[kIdx + 1] !== "–" &&
              keys[kIdx] !== "–" && (
                <span className="text-[10px] text-gray-400 dark:text-zinc-600 font-bold">
                  +
                </span>
              )}
          </span>
        );
      })}
    </div>
  );
});

KeyBadge.displayName = "KeyBadge";
