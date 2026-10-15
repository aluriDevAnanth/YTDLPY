import { Dropdown } from "primereact/dropdown";
import { formatOptions } from "../settingsConstants";

interface DefaultFormatDropdownProps {
  defaultFormat: "BEST" | "BESTAUDIO" | "WORST";
  setDefaultFormat: (format: "BEST" | "BESTAUDIO" | "WORST") => void;
}

export function DefaultFormatDropdown({
  defaultFormat,
  setDefaultFormat,
}: DefaultFormatDropdownProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-200">
        Default Video Quality Format
      </label>
      <Dropdown
        value={defaultFormat}
        options={formatOptions}
        onChange={(e) => setDefaultFormat(e.value)}
        className="w-full text-xs"
        itemTemplate={(opt) => (
          <div className="flex flex-col py-1">
            <span className="font-semibold text-xs text-gray-100">
              {opt.label}
            </span>
            <span className="text-[10px] text-gray-400">{opt.desc}</span>
          </div>
        )}
      />
    </div>
  );
}

export default DefaultFormatDropdown;
