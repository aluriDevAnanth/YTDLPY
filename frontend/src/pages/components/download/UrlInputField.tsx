import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { type Control, Controller, type FieldError } from "react-hook-form";
import type { DownloadFormT } from "src/schema";

interface UrlInputFieldProps {
  control: Control<DownloadFormT>;
  error?: FieldError;
}

export function UrlInputField({ control, error }: UrlInputFieldProps) {
  return (
    <div className="flex flex-col gap-1 grow">
      <FloatLabel>
        <Controller
          name="url"
          control={control}
          rules={{ required: "URL is required" }}
          render={({ field }) => (
            <InputText
              id="url"
              {...field}
              value={String(field.value ?? "")}
              className={`${error ? "p-invalid" : ""} w-full p-inputtext-sm`}
            />
          )}
        />
        <label htmlFor="url" className="text-xs">
          Video URL
        </label>
      </FloatLabel>
      {error && <small className="text-red-500 text-xs">{error.message}</small>}
    </div>
  );
}

export default UrlInputField;
