import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import {
  ToastDetailInput,
  ToastDurationInput,
  ToastOptionsCheckboxes,
  ToastPositionDropdown,
  ToastSummaryInput,
} from "./inputs";
import { ToastSeverityButtons } from "./ToastSeverityButtons";
import type { PositionType, SeverityType } from "./toastTestingTypes";

interface ToastConfigurationCardProps {
  severity: SeverityType;
  setSeverity: (sev: SeverityType) => void;
  summary: string;
  setSummary: (sum: string) => void;
  detail: string;
  setDetail: (det: string) => void;
  position: PositionType;
  setPosition: (pos: PositionType) => void;
  life: number;
  setLife: (l: number) => void;
  sticky: boolean;
  setSticky: (s: boolean) => void;
  closable: boolean;
  setClosable: (c: boolean) => void;
  onTrigger: () => void;
}

export function ToastConfigurationCard({
  severity,
  setSeverity,
  summary,
  setSummary,
  detail,
  setDetail,
  position,
  setPosition,
  life,
  setLife,
  sticky,
  setSticky,
  closable,
  setClosable,
  onTrigger,
}: ToastConfigurationCardProps) {
  return (
    <div className="lg:col-span-7 flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/60 pb-3">
        <span className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <Icon
            icon="tabler:adjustments-horizontal"
            className="text-cyan-600 dark:text-cyan-400 text-xl"
          />
          Configure Toast Payload
        </span>
        <Tag
          value="Interactive Form"
          severity="info"
          className="text-[10px] uppercase font-mono"
        />
      </div>

      <ToastSeverityButtons
        severity={severity}
        onSelectSeverity={setSeverity}
      />

      <ToastSummaryInput summary={summary} setSummary={setSummary} />
      <ToastDetailInput detail={detail} setDetail={setDetail} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToastPositionDropdown
          position={position}
          setPosition={setPosition}
        />
        <ToastDurationInput
          life={life}
          setLife={setLife}
          disabled={sticky}
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700/50 flex-wrap gap-3">
        <ToastOptionsCheckboxes
          sticky={sticky}
          setSticky={setSticky}
          closable={closable}
          setClosable={setClosable}
        />

        <Button
          label="Trigger Toast Now"
          icon="pi pi-send"
          severity="success"
          className="p-button-sm rounded-xl px-5 font-semibold"
          onClick={onTrigger}
        />
      </div>
    </div>
  );
}

export default ToastConfigurationCard;
