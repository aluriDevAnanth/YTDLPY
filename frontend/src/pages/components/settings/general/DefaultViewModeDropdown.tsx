import { Dropdown } from "primereact/dropdown";
import { viewModeOptions } from "../settingsConstants";

interface DefaultViewModeDropdownProps {
  defaultViewMode: "grid" | "table";
  setDefaultViewMode: (mode: "grid" | "table") => void;
}

export function DefaultViewModeDropdown({
  defaultViewMode,
  setDefaultViewMode,
}: DefaultViewModeDropdownProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-200">
        Default Dashboard View Mode
      </label>
      <Dropdown
        value={defaultViewMode}
        options={viewModeOptions}
        onChange={(e) => setDefaultViewMode(e.value)}
        className="w-full text-xs"
      />
    </div>
  );
}

export default DefaultViewModeDropdown;
