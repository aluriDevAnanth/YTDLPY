import { Icon } from "@iconify/react";
import axios from "axios";
import { ProgressBar } from "primereact/progressbar";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEffect, useMemo, useRef, useState } from "react";
import useAppStore from "src/store/useAppStore";
import { type VideoT } from "src/schema";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

function ProgressBarOrID({ rowData }: { rowData: VideoT }) {
  const throttledProgressTime = 500;
  const videoProgress = useAppStore((state) => state.videoProgress);
  const upsertVideo = useAppStore((state) => state.upsertVideo);
  const retryVideo = useAppStore((state) => state.retryVideo);
  const [copied, setCopied] = useState<boolean>(false);
  const lastUpdated = useRef<number>(0);

  const rawProgress = useMemo(
    () => videoProgress[rowData.id],
    [videoProgress, rowData.id],
  );

  const [throttledProgress, setThrottledProgress] = useState(rawProgress);

  useEffect(() => {
    const now = Date.now();
    const rawVal = rawProgress?.percent?.toString().replace("%", "");
    const rawPercent = rawVal ? parseFloat(rawVal) : 0;
    if (rawProgress?.speed === "FFmpeg" || rawPercent === 100 || !rawProgress) {
      setThrottledProgress(rawProgress);
      return;
    }
    if (now - lastUpdated.current >= throttledProgressTime) {
      setThrottledProgress(rawProgress);
      lastUpdated.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledProgress(rawProgress);
      }, throttledProgressTime);
      return () => clearTimeout(timeoutId);
    }
  }, [rawProgress]);

  const displayPercent = useMemo(() => {
    const val = throttledProgress?.percent?.toString().replace("%", "");
    if (val !== undefined && val !== null && val !== "") {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  }, [throttledProgress]);

  useEffect(() => {
    if (
      displayPercent === 100 &&
      rowData.downloadStatus !== "completed" &&
      rowData.downloadStatus !== "generating_sprites"
    ) {
      axios
        .get<VideoT>(`${API_BASE}/api/video/${rowData.id}`)
        .then((response) => upsertVideo(response.data))
        .catch(console.error);
    }
  }, [displayPercent, rowData.id, rowData.downloadStatus, upsertVideo]);

  const handleCopy = async (
    e: React.MouseEvent<HTMLSpanElement>,
  ): Promise<void> => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(rowData.id);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (rowData.downloadStatus === "completed") {
    return (
      <div className="w-full min-w-[140px] max-w-[190px] flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">
          {rowData.id}
        </span>
        <span
          onClick={handleCopy}
          className="px-2 py-1 h-7 text-xs flex items-center gap-1.5 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-0 text-gray-600 dark:text-gray-300 rounded-md shrink-0 transition-colors cursor-pointer"
        >
          <Icon
            icon={copied ? "tabler:check" : "tabler:copy"}
            className={`text-sm ${copied ? "text-emerald-500" : "text-gray-400"}`}
          />
          <span className="text-[11px] font-medium">{copied ? "Copied" : "Copy"}</span>
        </span>
      </div>
    );
  }

  if (rowData.downloadStatus === "generating_sprites") {
    return (
      <div className="w-full min-w-[140px] max-w-[190px] flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium tabular-nums">
        <div className="flex items-center gap-1.5 truncate">
          <ProgressSpinner
            strokeWidth="6"
            animationDuration="1.2s"
            className="size-3.5 p-0 m-0 shrink-0 text-emerald-400"
          />
          <span className="truncate">Generating preview</span>
        </div>
        <span className="font-mono text-emerald-300 font-bold shrink-0">
          {displayPercent > 0 ? `${displayPercent}%` : "0%"}
        </span>
      </div>
    );
  }

  if (rowData.downloadStatus === "packing_bundle" || throttledProgress?.speed === "Bundling") {
    return (
      <div className="w-full min-w-[140px] max-w-[190px] flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium tabular-nums">
        <div className="flex items-center gap-1.5 truncate">
          <ProgressSpinner
            strokeWidth="6"
            animationDuration="1.2s"
            className="size-3.5 p-0 m-0 shrink-0 text-amber-400"
          />
          <span className="truncate">Packing container</span>
        </div>
        <span className="font-mono text-amber-300 font-bold shrink-0">
          {displayPercent > 0 ? `${displayPercent}%` : "99%"}
        </span>
      </div>
    );
  }

  if (rowData.downloadStatus === "failed") {
    return (
      <div className="w-full min-w-[140px] max-w-[190px] flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium tabular-nums">
        <div className="flex items-center gap-1.5 truncate">
          <Icon icon="tabler:alert-triangle" className="text-red-400 text-sm shrink-0" />
          <span className="truncate font-semibold text-red-300">Failed</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            retryVideo(rowData.id);
          }}
          className="p-1 rounded hover:bg-red-900/60 text-red-200 hover:text-white transition-colors cursor-pointer border-0 flex items-center justify-center shrink-0"
          title="Retry Download"
        >
          <Icon icon="tabler:refresh" className="text-sm" />
        </button>
      </div>
    );
  }

  if (throttledProgress) {
    return (
      <div className="w-full min-w-[140px] max-w-[190px] flex flex-col gap-1.5">
        <div className="flex gap-1 items-center">
          <ProgressBar
            className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 items-center"
            value={displayPercent}
            showValue={false}
          />
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono tabular-nums">
            {displayPercent > 0 ? `${displayPercent}%` : "0%"}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400 font-mono tabular-nums">
          <span className="truncate max-w-[90px]">{throttledProgress.downloadedSize}</span>
          <span className="text-cyan-600 dark:text-cyan-400 truncate max-w-[65px]">{throttledProgress.speed}</span>
          <span className="text-amber-600 dark:text-amber-400 truncate max-w-[55px]">{throttledProgress.eta}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-[140px] max-w-[190px] flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <ProgressSpinner
        strokeWidth="6"
        animationDuration="1s"
        className="size-4 p-0 m-0 shrink-0"
      />
      <span className="truncate">Starting download...</span>
    </div>
  );
}

export default ProgressBarOrID;
