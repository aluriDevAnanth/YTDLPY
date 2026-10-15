import { Icon } from "@iconify/react";
import { memo } from "react";
import { AuthStorageModeDropdown } from "./AuthStorageModeDropdown";
import { AutoVttSwitch } from "./AutoVttSwitch";
import { DefaultFormatDropdown } from "./DefaultFormatDropdown";
import { DefaultViewModeDropdown } from "./DefaultViewModeDropdown";
import { MaxConcurrentInput } from "./MaxConcurrentInput";

interface GeneralSettingsSectionProps {
  defaultFormat: "BEST" | "BESTAUDIO" | "WORST";
  setDefaultFormat: (format: "BEST" | "BESTAUDIO" | "WORST") => void;
  defaultViewMode: "grid" | "table";
  setDefaultViewMode: (mode: "grid" | "table") => void;
  maxConcurrent: number;
  setMaxConcurrent: (count: number) => void;
  autoVtt: boolean;
  setAutoVtt: (auto: boolean) => void;
  authStorageMode: "session" | "local";
  setAuthStorageModeState: (mode: "session" | "local") => void;
}

export const GeneralSettingsSection = memo(
  ({
    defaultFormat,
    setDefaultFormat,
    defaultViewMode,
    setDefaultViewMode,
    maxConcurrent,
    setMaxConcurrent,
    autoVtt,
    setAutoVtt,
    authStorageMode,
    setAuthStorageModeState,
  }: GeneralSettingsSectionProps) => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-gray-900/80 backdrop-blur-xs border border-gray-800/80 hover:border-gray-700/80 transition-all h-full shadow-xs">
          <div className="flex flex-col gap-1 border-b border-gray-800/80 pb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Icon icon="tabler:sliders" className="text-cyan-400 text-base" />
              General & Layout
            </span>
            <span className="text-[11px] text-gray-400">
              Display modes and download defaults
            </span>
          </div>

          <DefaultFormatDropdown
            defaultFormat={defaultFormat}
            setDefaultFormat={setDefaultFormat}
          />

          <DefaultViewModeDropdown
            defaultViewMode={defaultViewMode}
            setDefaultViewMode={setDefaultViewMode}
          />

          <MaxConcurrentInput
            maxConcurrent={maxConcurrent}
            setMaxConcurrent={setMaxConcurrent}
          />

          <AutoVttSwitch autoVtt={autoVtt} setAutoVtt={setAutoVtt} />

          <AuthStorageModeDropdown
            authStorageMode={authStorageMode}
            setAuthStorageModeState={setAuthStorageModeState}
          />
        </div>
      </div>
    );
  },
);

GeneralSettingsSection.displayName = "GeneralSettingsSection";

export default GeneralSettingsSection;
