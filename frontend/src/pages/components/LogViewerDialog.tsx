import { Icon } from "@iconify/react";
import axios from "axios";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import ReactJson from "react-json-view";
import type { VideoT } from "src/schema";
import { getAuthToken } from "src/store/useAppStore";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export interface LogEntry {
  timestamp: string;
  stage: string;
  level: string;
  message: string;
  details?: Record<string, any>;
}

export default function LogViewerDialog({
  visible,
  setVisible,
  video,
}: {
  visible: boolean;
  setVisible: (val: boolean) => void;
  video: VideoT;
}) {
  const toast = useRef<Toast>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [rawNdjson, setRawNdjson] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible && video) {
      setLoading(true);
      setError(null);
      const token = getAuthToken() || "";
      const logUrl = `${API_BASE}/api/files/${video.id}_log?token=${token}`;

      axios
        .get<string>(logUrl, { responseType: "text" })
        .then((res) => {
          const text = res.data || "";
          setRawNdjson(text);
          const parsedLogs: LogEntry[] = [];
          const lines = text.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              try {
                parsedLogs.push(JSON.parse(trimmed));
              } catch (e) {
                parsedLogs.push({
                  timestamp: new Date().toISOString(),
                  stage: "RAW",
                  level: "INFO",
                  message: trimmed,
                });
              }
            }
          }
          setLogs(parsedLogs);
        })
        .catch((err) => {
          console.error("Failed to load logs:", err);
          setError("No execution log file found for this video download.");
        })
        .finally(() => setLoading(false));
    }
  }, [visible, video]);

  const copyLogsToClipboard = () => {
    navigator.clipboard.writeText(rawNdjson);
    toast.current?.show({
      severity: "info",
      summary: "Copied",
      detail: "Log output copied to clipboard",
    });
  };

  const startTimeMs = logs.length > 0 ? new Date(logs[0].timestamp).getTime() : 0;
  const endTimeMs = logs.length > 0 ? new Date(logs[logs.length - 1].timestamp).getTime() : 0;
  const totalDurationSec =
    startTimeMs > 0 && endTimeMs > 0 ? Math.max(0, (endTimeMs - startTimeMs) / 1000) : 0;

  const getStageBadge = (stage: string, level: string) => {
    if (level === "ERROR") {
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30";
    }
    if (stage.startsWith("INITIALIZATION")) {
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30";
    }
    if (stage.startsWith("YT_DLP_METADATA")) {
      return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30";
    }
    if (stage.startsWith("MEDIA_DOWNLOAD") || stage === "DOWNLOAD_PROGRESS") {
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
    }
    if (stage.startsWith("FFMPEG_SPRITES")) {
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    }
    if (stage.startsWith("BUNDLE_PACKING")) {
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30";
    }
    if (stage === "COMPLETED") {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    }
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
  };

  const renderLogCard = (log: LogEntry, idx: number) => {
    const badgeStyle = getStageBadge(log.stage, log.level);
    const eventTimeMs = new Date(log.timestamp).getTime();
    const elapsedSec =
      startTimeMs > 0 && !isNaN(eventTimeMs)
        ? Math.max(0, (eventTimeMs - startTimeMs) / 1000)
        : 0;

    return (
      <div
        key={idx}
        className="flex flex-col gap-2 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 text-xs shadow-2xs transition-all hover:border-gray-300 dark:hover:border-gray-700"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeline Elapsed Seconds Badge */}
            <span
              className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/25 flex items-center gap-1 shrink-0"
              title={`Elapsed time since download start (${log.timestamp})`}
            >
              <Icon icon="tabler:stopwatch" className="text-xs text-cyan-600 dark:text-cyan-400" />
              +{elapsedSec.toFixed(1)}s
            </span>

            {/* Stage Badge */}
            <span
              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border tracking-wider shrink-0 ${badgeStyle}`}
            >
              {log.stage}
            </span>

            <span className="font-semibold text-gray-800 dark:text-gray-100">{log.message}</span>
          </div>

          <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 shrink-0">
            <Icon icon="tabler:clock" className="text-gray-400 dark:text-gray-500" />
            {log.timestamp}
          </span>
        </div>

        {log.details && Object.keys(log.details).length > 0 && (
          <div className="mt-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800/60 overflow-x-auto">
            <ReactJson
              src={log.details}
              theme={isDarkMode ? "ocean" : undefined}
              name={false}
              collapsed={1}
              enableClipboard={false}
              displayDataTypes={false}
              displayObjectSize={false}
              style={{ fontSize: "11px", backgroundColor: "transparent" }}
            />
          </div>
        )}
      </div>
    );
  };

  const headerActionPT = { "headerAction": { className: "py-2 px-3" } }

  return (
    <Dialog
      header={
        <div className="flex items-center justify-between w-full font-sans">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Icon icon="tabler:terminal-2" className="text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-gray-900 dark:text-gray-100 tracking-tight">
                Download Execution Logs & Timeline
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal truncate max-w-md">
                {video.fullTitle || video.url} ({video.id})
              </span>
            </div>
          </div>
          <Button
            type="button"
            severity="secondary"
            className="px-2.5 py-1 text-xs flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md"
            onClick={copyLogsToClipboard}
            title="Copy NDJSON Output"
          >
            <Icon icon="tabler:copy" className="text-sm text-cyan-600 dark:text-cyan-400" />
            <span>Copy NDJSON</span>
          </Button>
        </div >
      }
      visible={visible}
      style={{ width: "95vw", height: "90vh" }}
      onHide={() => setVisible(false)}
      dismissableMask
      className="font-sans"
    >
      <Toast ref={toast} />

      {
        loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-cyan-600 dark:text-cyan-400">
            <Icon icon="tabler:loader-2" className="text-3xl animate-spin" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Fetching lifecycle log entries...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-10 gap-3 text-center">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Icon icon="tabler:file-off" className="text-3xl" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{error}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
              Log recording is enabled for all new downloads. Older legacy downloads may not contain a download.ndjson log file.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Summary Timeline KPI Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-gray-100/90 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800/80 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                  Total Execution Time
                </span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm flex items-center gap-1">
                  <Icon icon="tabler:stopwatch" className="text-base text-cyan-600 dark:text-cyan-400" />
                  {totalDurationSec.toFixed(1)}s
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                  Start Timestamp (UTC)
                </span>
                <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {logs[0]?.timestamp.split("T")[1]?.replace("Z", "") || "00:00:00"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                  End Timestamp (UTC)
                </span>
                <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {logs[logs.length - 1]?.timestamp.split("T")[1]?.replace("Z", "") || "00:00:00"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                  Recorded Events
                </span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                  {logs.length} Events
                </span>
              </div>
            </div>

            <TabView className="font-sans text-xs" pt={{ "panelContainer": { className: "p-0 px-2" }, }}>
              <TabPanel header={`All Events (${logs.length})`} pt={headerActionPT}>
                <div className="flex flex-col gap-2.5   overflow-y-auto pr-1 py-2">
                  {logs.map(renderLogCard)}
                </div>
              </TabPanel>

              <TabPanel pt={headerActionPT}
                header={`FFmpeg / Sprites (${logs.filter((l) => l.stage.startsWith("FFMPEG_SPRITES")).length})`}
              >
                <div className="flex flex-col gap-2.5   overflow-y-auto pr-1 py-2">
                  {logs.filter((l) => l.stage.startsWith("FFMPEG_SPRITES")).map(renderLogCard)}
                </div>
              </TabPanel>

              <TabPanel pt={headerActionPT}
                header={`Errors (${logs.filter((l) => l.level === "ERROR").length})`}
              >
                <div className="flex flex-col gap-2.5   overflow-y-auto pr-1 py-2">
                  {logs.filter((l) => l.level === "ERROR").length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-xs">
                      No error events recorded for this download.
                    </div>
                  ) : (
                    logs.filter((l) => l.level === "ERROR").map(renderLogCard)
                  )}
                </div>
              </TabPanel>

              <TabPanel header="Raw NDJSON Output" pt={headerActionPT}>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-cyan-300 font-mono text-xs   border border-gray-200 dark:border-gray-800 leading-relaxed whitespace-pre-wrap">
                  {rawNdjson}
                </div>
              </TabPanel>
            </TabView>
          </div>
        )
      }
    </Dialog >
  );
}
