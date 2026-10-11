import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import type { VideoT } from "src/schema";
import useAppStore from "src/store/useAppStore";
import { DownloadProgressBar } from "./DownloadProgressBar";
import { DownloadStatusBadge } from "./DownloadStatusBadge";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export function ProgressBarOrID({ rowData }: { rowData: VideoT }) {
  const throttledProgressTime = 500;
  const videoProgress = useAppStore((state) => state.videoProgress);
  const upsertVideo = useAppStore((state) => state.upsertVideo);
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

  if (
    rowData.downloadStatus === "completed" ||
    rowData.downloadStatus === "generating_sprites" ||
    rowData.downloadStatus === "packing_bundle" ||
    rowData.downloadStatus === "failed" ||
    throttledProgress?.speed === "Bundling"
  ) {
    return (
      <DownloadStatusBadge
        rowData={rowData}
        displayPercent={displayPercent}
      />
    );
  }

  return (
    <DownloadProgressBar
      progress={throttledProgress}
      displayPercent={displayPercent}
    />
  );
}

export default ProgressBarOrID;
