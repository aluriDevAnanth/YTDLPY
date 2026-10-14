import { Icon } from "@iconify/react";
import { memo } from "react";

interface SettingsHeaderProps {
  isAdmin: boolean;
}

export const SettingsHeader = memo(({ isAdmin }: SettingsHeaderProps) => {
  return (
    <div className="flex items-center gap-2.5 font-sans py-0.5">
      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        <Icon icon="tabler:adjustments" className="text-xl" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-base text-gray-100 tracking-tight flex items-center gap-2">
          User Preferences & Settings
          {isAdmin && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ADMIN GLOBAL DEFAULTS
            </span>
          )}
        </span>
        <span className="text-[11px] text-gray-400 font-normal">
          {isAdmin
            ? "Configure global defaults for all users, download quality, and multi-browser cookies"
            : "Configure your personal download defaults, layout, and authentication cookies"}
        </span>
      </div>
    </div>
  );
});

SettingsHeader.displayName = "SettingsHeader";
