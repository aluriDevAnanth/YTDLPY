import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { ToastConfigurationCard } from "./ToastConfigurationCard";
import { ToastHeaderBanner } from "./ToastHeaderBanner";
import { ToastHistoryLog } from "./history";
import { ToastPositionPicker } from "./ToastPositionPicker";
import { ToastPresetsCard } from "./ToastPresetsCard";
import type {
  PositionType,
  SeverityType,
  ToastLogEntry,
} from "./toastTestingTypes";

export function ToastTesting() {
  const toastRef = useRef<Toast>(null);

  // Form State
  const [severity, setSeverity] = useState<SeverityType>("success");
  const [summary, setSummary] = useState<string>("Operation Successful");
  const [detail, setDetail] = useState<string>(
    "Your requested action was processed cleanly.",
  );
  const [position, setPosition] = useState<PositionType>("top-right");
  const [life, setLife] = useState<number>(3000);
  const [sticky, setSticky] = useState<boolean>(false);
  const [closable, setClosable] = useState<boolean>(true);

  // History Log State
  const [toastLog, setToastLog] = useState<ToastLogEntry[]>([]);

  const triggerToast = (
    overrideConfig?: Partial<{
      severity: SeverityType;
      summary: string;
      detail: string;
      position: PositionType;
      life: number;
      sticky: boolean;
      closable: boolean;
    }>,
  ) => {
    const activeSeverity = overrideConfig?.severity ?? severity;
    const activeSummary = overrideConfig?.summary ?? summary;
    const activeDetail = overrideConfig?.detail ?? detail;
    const activeLife =
      overrideConfig?.sticky ?? sticky
        ? undefined
        : (overrideConfig?.life ?? life);
    const activeSticky = overrideConfig?.sticky ?? sticky;
    const activeClosable = overrideConfig?.closable ?? closable;

    toastRef.current?.show({
      severity: activeSeverity,
      summary: activeSummary,
      detail: activeDetail,
      life: activeSticky ? undefined : activeLife,
      sticky: activeSticky,
      closable: activeClosable,
    });

    const newLog: ToastLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      severity: activeSeverity,
      summary: activeSummary,
      detail: activeDetail,
      position,
      sticky: activeSticky,
    };

    setToastLog((prev) => [newLog, ...prev.slice(0, 29)]);
  };

  const triggerSequence = () => {
    toastRef.current?.show([
      {
        severity: "info",
        summary: "Step 1: Connecting",
        detail: "Establishing connection to streaming server...",
        life: 3000,
      },
      {
        severity: "warn",
        summary: "Step 2: Processing Media",
        detail: "Transcoding video stream into 1080p format...",
        life: 4500,
      },
      {
        severity: "success",
        summary: "Step 3: Complete!",
        detail: "Video downloaded and indexed into library.",
        life: 6000,
      },
    ]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 flex flex-col gap-4 font-sans text-gray-900 dark:text-gray-100">
      <Toast ref={toastRef} position={position} />

      <ToastHeaderBanner onBurstTest={triggerSequence} />

      {/* Main Grid: Form + Position Matrix & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <ToastConfigurationCard
          severity={severity}
          setSeverity={setSeverity}
          summary={summary}
          setSummary={setSummary}
          detail={detail}
          setDetail={setDetail}
          position={position}
          setPosition={setPosition}
          life={life}
          setLife={setLife}
          sticky={sticky}
          setSticky={setSticky}
          closable={closable}
          setClosable={setClosable}
          onTrigger={() => triggerToast()}
        />

        <div className="lg:col-span-5 flex flex-col gap-4">
          <ToastPresetsCard
            onTriggerPreset={(cfg) => triggerToast(cfg)}
          />

          <ToastPositionPicker
            position={position}
            onSelectPosition={(pos) => {
              setPosition(pos);
              triggerToast({
                position: pos,
                summary: `Toast fired at ${pos}`,
                detail: `Position set to '${pos}'.`,
              });
            }}
          />
        </div>
      </div>

      {/* Session Toast Log Table */}
      <ToastHistoryLog
        logs={toastLog}
        onClear={() => setToastLog([])}
        onRetrigger={(log) =>
          triggerToast({
            severity: log.severity,
            summary: log.summary,
            detail: log.detail,
          })
        }
      />
    </div>
  );
}

export default ToastTesting;
