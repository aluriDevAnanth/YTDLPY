import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

type SeverityType = "success" | "info" | "warn" | "error";

type PositionType =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

interface ToastLogEntry {
  id: string;
  timestamp: string;
  severity: SeverityType;
  summary: string;
  detail: string;
  position: PositionType;
  sticky: boolean;
}

const positionOptions: { label: string; value: PositionType }[] = [
  { label: "Top Right", value: "top-right" },
  { label: "Top Left", value: "top-left" },
  { label: "Top Center", value: "top-center" },
  { label: "Bottom Right", value: "bottom-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Center", value: "bottom-center" },
];

export default function ToastTesting() {
  const toastRef = useRef<Toast>(null);

  // Form State
  const [severity, setSeverity] = useState<SeverityType>("success");
  const [summary, setSummary] = useState<string>("Operation Successful");
  const [detail, setDetail] = useState<string>("Your requested action was processed cleanly.");
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
    const activeLife = overrideConfig?.sticky ?? sticky ? undefined : (overrideConfig?.life ?? life);
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

  const getSeverityBadgeClass = (sev: SeverityType) => {
    switch (sev) {
      case "success":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "info":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      case "warn":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "error":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 flex flex-col gap-4 font-sans text-gray-900 dark:text-gray-100">
      <Toast ref={toastRef} position={position} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
            <Icon icon="tabler:bell-ringing" className="text-2xl sm:text-3xl" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Toast Notification Studio
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Interactive playground to trigger, customize, and test system toast alerts across positions & themes.
            </p>
          </div>
        </div>

        <Button
          label="Burst Test (3 Toasts)"
          icon="pi pi-bolt"
          severity="help"
          className="p-button-sm rounded-xl shrink-0"
          onClick={triggerSequence}
        />
      </div>

      {/* Main Grid: Form + Position Matrix & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form: Custom Toast Configuration (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/60 pb-3">
            <span className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Icon icon="tabler:adjustments-horizontal" className="text-cyan-600 dark:text-cyan-400 text-xl" />
              Configure Toast Payload
            </span>
            <Tag value="Interactive Form" severity="info" className="text-[10px] uppercase font-mono" />
          </div>

          {/* Severity Radio Cards */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Select Toast Severity
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["success", "info", "warn", "error"] as SeverityType[]).map((sev) => {
                const isSelected = severity === sev;
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-2 ring-cyan-500/20"
                        : "border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon
                      icon={
                        sev === "success"
                          ? "tabler:circle-check"
                          : sev === "info"
                            ? "tabler:info-circle"
                            : sev === "warn"
                              ? "tabler:alert-triangle"
                              : "tabler:circle-x"
                      }
                      className="text-base"
                    />
                    <span>{sev}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary / Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Toast Title (Summary)
            </label>
            <InputText
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter toast title..."
              className="p-inputtext-sm w-full rounded-xl"
            />
          </div>

          {/* Detail / Description Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Detailed Message
            </label>
            <InputTextarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Enter detailed toast text message..."
              rows={2}
              className="p-inputtext-sm w-full rounded-xl resize-none"
            />
          </div>

          {/* Position & Duration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Display Position
              </label>
              <Dropdown
                value={position}
                options={positionOptions}
                onChange={(e) => setPosition(e.value)}
                className="w-full p-inputtext-sm rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Auto-Close Duration (ms)
              </label>
              <InputNumber
                value={life}
                onValueChange={(e) => setLife(e.value ?? 3000)}
                disabled={sticky}
                min={500}
                max={60000}
                step={500}
                className="w-full p-inputtext-sm rounded-xl"
                suffix=" ms"
              />
            </div>
          </div>

          {/* Checkboxes & Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700/50 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={sticky}
                  onChange={(e) => setSticky(e.target.checked)}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                Sticky (Persistent)
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={closable}
                  onChange={(e) => setClosable(e.target.checked)}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                Closable
              </label>
            </div>

            <Button
              label="Trigger Toast Now"
              icon="pi pi-send"
              severity="success"
              className="p-button-sm rounded-xl px-5 font-semibold"
              onClick={() => triggerToast()}
            />
          </div>
        </div>

        {/* Right Column: Presets & Screen Position Target Matrix (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Quick Preset Buttons Card */}
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
                  triggerToast({
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
                  triggerToast({
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
                  triggerToast({
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
                  triggerToast({
                    severity: "info",
                    summary: "yt-dlp Updated",
                    detail: "Engine upgraded to build 2026.08.10 automatically.",
                  })
                }
              />
            </div>
          </div>

          {/* Interactive Screen Position Target Grid */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm">
            <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Icon icon="tabler:target" className="text-cyan-600 dark:text-cyan-400 text-lg" />
              Click Position Grid to Fire Toast
            </span>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              {[
                { label: "Top-Left", val: "top-left" as PositionType },
                { label: "Top-Center", val: "top-center" as PositionType },
                { label: "Top-Right", val: "top-right" as PositionType },
                { label: "Bot-Left", val: "bottom-left" as PositionType },
                { label: "Bot-Center", val: "bottom-center" as PositionType },
                { label: "Bot-Right", val: "bottom-right" as PositionType },
              ].map((pos) => (
                <button
                  key={pos.val}
                  type="button"
                  onClick={() => {
                    setPosition(pos.val);
                    triggerToast({
                      position: pos.val,
                      summary: `Toast fired at ${pos.label}`,
                      detail: `Position set to '${pos.val}'.`,
                    });
                  }}
                  className={`p-3 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                    position === pos.val
                      ? "border-cyan-500 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-extrabold shadow-xs"
                      : "border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-cyan-400"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Session Toast Log Table */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/60 pb-3">
          <span className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Icon icon="tabler:history" className="text-cyan-600 dark:text-cyan-400 text-xl" />
            Session Toast Trigger History ({toastLog.length})
          </span>

          {toastLog.length > 0 && (
            <Button
              label="Clear Log"
              icon="pi pi-trash"
              severity="secondary"
              text
              size="small"
              onClick={() => setToastLog([])}
            />
          )}
        </div>

        {toastLog.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">
            No toasts fired yet in this session. Use the controls above to launch toasts!
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {toastLog.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/40 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border uppercase ${getSeverityBadgeClass(log.severity)}`}>
                    {log.severity}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                    {log.summary}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 truncate hidden sm:inline">
                    — {log.detail}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
                    {log.timestamp} ({log.position})
                  </span>

                  <Button
                    icon="pi pi-refresh"
                    severity="secondary"
                    outlined
                    className="p-button-sm size-7 !p-0"
                    tooltip="Re-trigger"
                    onClick={() => triggerToast({ severity: log.severity, summary: log.summary, detail: log.detail })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
