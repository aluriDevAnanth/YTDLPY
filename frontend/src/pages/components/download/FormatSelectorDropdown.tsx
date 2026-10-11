import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { type Control, Controller } from "react-hook-form";
import type { DownloadFormT } from "src/schema";

export const formatOptions = [
  { label: "Best", value: "BEST" },
  { label: "Audio Only", value: "BESTAUDIO" },
  { label: "Worst", value: "WORST" },
];

interface FormatSelectorDropdownProps {
  control: Control<DownloadFormT>;
}

export function FormatSelectorDropdown({ control }: FormatSelectorDropdownProps) {
  return (
    <div className="w-full sm:w-44 shrink-0">
      <FloatLabel>
        <Controller
          name="format"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="format"
              {...field}
              options={formatOptions}
              optionLabel="label"
              value={field.value}
              className="w-full p-inputtext-sm"
            />
          )}
        />
        <label htmlFor="format" className="text-xs">
          Format
        </label>
      </FloatLabel>
    </div>
  );
}

export default FormatSelectorDropdown;
