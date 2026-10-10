import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "src/context/authStore";
import useVideoStore from "src/context/videoStore";
import {
  DownloadFormS,
  type DownloadFormT,
  VideoS,
  type VideoT,
} from "src/schema";
import { DownloadModeRadios } from "./DownloadModeRadios";
import { DownloadSubmitButton } from "./DownloadSubmitButton";
import { FormatSelectorDropdown } from "./FormatSelectorDropdown";
import { UrlInputField } from "./UrlInputField";
import { hashUrl } from "../../../utils/hash";

export function DownloadForm() {
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
  const setAddDownloadOpen = useAuthStore((s) => s.setAddDownloadOpen);
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
        setAddDownloadOpen(false);
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

      <UrlInputField control={control} error={errors.url} />
      <FormatSelectorDropdown control={control} />
      <DownloadModeRadios control={control} />
      <DownloadSubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}

export default DownloadForm;
