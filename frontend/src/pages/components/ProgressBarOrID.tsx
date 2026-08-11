import { Icon } from "@iconify/react";
import axios from "axios";
import { Button } from "primereact/button";
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
    if (rowData.downloadStatus === "generating_sprites") {
      if (throttledProgress?.speed === "FFmpeg") {
        const val = throttledProgress?.percent?.toString().replace("%", "");
        return val ? parseFloat(val) : 0;
      }
      return 0;
    }
    const val = throttledProgress?.percent?.toString().replace("%", "");
    return val ? parseFloat(val) : 0;
  }, [throttledProgress, rowData.downloadStatus]);
  useEffect(() => {
    if (displayPercent === 100 && rowData.downloadStatus !== "completed" && rowData.downloadStatus !== "generating_sprites") {
      axios
        .get<VideoT>(`${API_BASE}/api/video/${rowData.id}`)
        .then((response) => upsertVideo(response.data))
        .catch(console.error);
    }
  }, [displayPercent, rowData.id, rowData.downloadStatus, upsertVideo]);
  const handleCopy = async (
    e: React.MouseEvent<HTMLButtonElement>,
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
      <div className="w-[220px] min-w-[220px] max-w-[220px] flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-gray-300 truncate">{rowData.id}</span>
        <Button
          onClick={handleCopy}
          className="px-2 py-1 h-7 text-xs flex items-center gap-1.5 bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700/60 rounded-md shrink-0 transition-colors"
        >
          <Icon
            icon={copied ? "tabler:check" : "tabler:copy"}
            className={`text-sm ${copied ? "text-emerald-400" : "text-gray-400"}`}
          />
          <span className="text-[11px] font-medium">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
    );
  }
  if (rowData.downloadStatus === "generating_sprites") {
    return (
      <div className="w-[220px] min-w-[220px] max-w-[220px] flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium tabular-nums">
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
      <div className="w-[220px] min-w-[220px] max-w-[220px] flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium tabular-nums">
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
  if (throttledProgress) {
    return (
      <div className="w-[220px] min-w-[220px] max-w-[220px] flex flex-col gap-1.5">
        <div className="flex gap-1 items-center">
          <ProgressBar className="w-full h-1.5 rounded-full bg-gray-800 items-center" value={displayPercent} showValue={false} />
          <span className="text-[11px] text-gray-400 font-mono tabular-nums">{displayPercent > 0 ? `${displayPercent}%` : "0%"}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-gray-400 font-mono tabular-nums">
          <span className="truncate max-w-[90px]">{throttledProgress.downloadedSize}</span>
          <span className="text-cyan-400 truncate max-w-[65px]">{throttledProgress.speed}</span>
          <span className="text-amber-400 truncate max-w-[55px]">{throttledProgress.eta}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="w-[220px] min-w-[220px] max-w-[220px] flex items-center gap-2 text-xs text-gray-400">
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
