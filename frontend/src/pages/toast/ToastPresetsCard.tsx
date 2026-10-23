import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import type { PositionType, SeverityType } from "./toastTestingTypes";

interface ToastPresetsCardProps {
  onTriggerPreset: (config: {
    severity: SeverityType;
    summary: string;
    detail: string;
    position?: PositionType;
  }) => void;
}

export function ToastPresetsCard({ onTriggerPreset }: ToastPresetsCardProps) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm">
      <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
        <Icon icon="tabler:sparkles" className="text-amber-500 text-lg" />
        Quick System Alert Presets
      </span>

      <div className="grid grid-cols-2 gap-2">
        <Button
          label="Download Done"
          icon="pi pi-check-circle"
          severity="success"
          outlined
          className="p-button-sm rounded-xl text-xs py-2"
          onClick={() =>
            onTriggerPreset({
              severity: "success",
              summary: "Download Completed",
              detail: "Cyberpunk 2077 Trailer (1080p 60fps) saved successfully.",
            })
          }
        />

        <Button
          label="Disk Warning"
          icon="pi pi-exclamation-triangle"
          severity="warning"
          outlined
          className="p-button-sm rounded-xl text-xs py-2"
          onClick={() =>
            onTriggerPreset({
              severity: "warn",
              summary: "High Storage Usage",
              detail: "Disk partition is at 88% capacity (14.2 GB free).",
            })
          }
        />

        <Button
          label="API Network Error"
          icon="pi pi-times-circle"
          severity="danger"
          outlined
          className="p-button-sm rounded-xl text-xs py-2"
          onClick={() =>
            onTriggerPreset({
              severity: "error",
              summary: "Backend Unavailable",
              detail: "Failed to connect to backend server at port 8000.",
            })
          }
        />

        <Button
          label="System Info"
          icon="pi pi-info-circle"
          severity="info"
          outlined
          className="p-button-sm rounded-xl text-xs py-2"
          onClick={() =>
            onTriggerPreset({
              severity: "info",
              summary: "yt-dlp Updated",
              detail: "Engine upgraded to build 2026.08.10 automatically.",
            })
          }
        />
      </div>
    </div>
  );
}

export default ToastPresetsCard;
