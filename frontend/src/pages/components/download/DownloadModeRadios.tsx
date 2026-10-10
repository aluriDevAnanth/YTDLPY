import { RadioButton } from "primereact/radiobutton";
import { type Control, Controller } from "react-hook-form";
import type { DownloadFormT } from "src/schema";

interface DownloadModeRadiosProps {
  control: Control<DownloadFormT>;
}

export function DownloadModeRadios({ control }: DownloadModeRadiosProps) {
  return (
    <div className="flex sm:flex-col gap-3 sm:gap-1 px-1 justify-center shrink-0">
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <div className="flex sm:flex-col gap-3 sm:gap-1.5">
            <div className="flex items-center gap-2">
              <RadioButton
                inputId="type-download"
                value="download"
                checked={field.value === "download"}
                onChange={(e) => field.onChange(e.value)}
              />
              <label htmlFor="type-download" className="text-xs select-none">
                Download
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioButton
                inputId="type-scan"
                value="scan"
                checked={field.value === "scan"}
                onChange={(e) => field.onChange(e.value)}
              />
              <label htmlFor="type-scan" className="text-xs select-none">
                Scan
              </label>
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default DownloadModeRadios;
