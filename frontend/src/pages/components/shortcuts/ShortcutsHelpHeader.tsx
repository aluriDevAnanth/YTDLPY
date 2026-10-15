import { Icon } from "@iconify/react";
import { memo } from "react";

export const ShortcutsHelpHeader = memo(() => {
  return (
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
  );
});

ShortcutsHelpHeader.displayName = "ShortcutsHelpHeader";
