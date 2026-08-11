import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import { Toast } from "primereact/toast";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAuthStore } from "src/context/authStore";
import useVideoStore from "src/context/videoStore";
import {
  DownloadFormS,
  type DownloadFormT,
  VideoS,
  type VideoT,
} from "../../schema";
const formatOptions = [
  { label: "Best", value: "BEST" },
  { label: "Audio Only", value: "BESTAUDIO" },
  { label: "Worst", value: "WORST" },
];
async function hashUrl(url: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex.slice(0, 16);
}
export default function DownloadForm() {
  const userSettings = useAuthStore((s) => s.settings);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DownloadFormT>({
    defaultValues: {
      id: "",
      url: "",
      format: userSettings?.default_format || "BEST",
      type: "download",
    },
    resolver: zodResolver(DownloadFormS),
  });
  useEffect(() => {
    if (userSettings?.default_format) {
      setValue("format", userSettings.default_format);
    }
  }, [userSettings, setValue]);
  const upsertVideo = useVideoStore((state) => state.upsertVideo);
  const toastMain = useRef<Toast>(null);
  const onSubmit = async (data: DownloadFormT) => {
    const dataa: VideoT = {
      id: await hashUrl(data.url),
      videoId: "",
      url: data.url,
      size: "",
      fullTitle: "",
      durationString: "",
      resolution: "",
      downloadStatus: "queued",
      audioOnly: false,
      watched: false,
      downloaded: false,
      prevWatchTime: 0,
      format: data.format,
      type: data.type,
      videoPathId: "",
      thumbnailPathId: "",
      vttPathId: "",
      vttSpritePathId: "",
    };
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:8000/api/video",
      headers: {
        "Content-Type": "application/json",
      },
      data: dataa,
    };
    await axios
      .request(config)
      .then((response) => {
        const newVideo = VideoS.parse(response.data);
        upsertVideo(newVideo);
        reset();
      })
      .catch((error) => {
        console.error(error);
        toastMain.current?.show({
          severity: "error",
          summary: "Error",
          detail: `Error initiating download: ${error.response?.data?.detail || error.message}`,
        });
      });
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 items-stretch sm:items-end w-full"
    >
      <Toast ref={toastMain} />

      {/* URL Input */}
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
                className={`${errors.url ? "p-invalid" : ""} w-full p-inputtext-sm`}
              />
            )}
          />
          <label htmlFor="url" className="text-xs">
            Video URL
          </label>
        </FloatLabel>
        {errors.url && (
          <small className="text-red-500 text-xs">{errors.url.message}</small>
        )}
      </div>

      {/* Format Options Dropdown */}
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

      {/* Mode Radios (Download / Scan) */}
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

      {/* Submit Button */}
      <div className="shrink-0">
        <Button
          loading={isSubmitting}
          type="submit"
          label="Download"
          icon="pi pi-download"
          className="w-full sm:w-auto p-button-sm font-medium"
        />
      </div>
    </form>
  );
}
