import type { VideoT } from "src/schema";
import useAppStore from "src/store/useAppStore";
import { DownloadBundlingBadge } from "./DownloadBundlingBadge";
import { DownloadFailedBadge } from "./DownloadFailedBadge";
import { DownloadPreviewBadge } from "./DownloadPreviewBadge";
import { VideoIdCopyButton } from "./VideoIdCopyButton";

interface DownloadStatusBadgeProps {
  rowData: VideoT;
  displayPercent: number;
}

export function DownloadStatusBadge({
  rowData,
  displayPercent,
}: DownloadStatusBadgeProps) {
  const retryVideo = useAppStore((state) => state.retryVideo);

  if (rowData.downloadStatus === "completed") {
    return <VideoIdCopyButton id={rowData.id} />;
  }

  if (rowData.downloadStatus === "generating_sprites") {
    return <DownloadPreviewBadge displayPercent={displayPercent} />;
  }

  if (rowData.downloadStatus === "packing_bundle") {
    return <DownloadBundlingBadge displayPercent={displayPercent} />;
  }

  if (rowData.downloadStatus === "failed") {
    return <DownloadFailedBadge onRetry={() => retryVideo(rowData.id)} />;
  }

  return null;
}

export default DownloadStatusBadge;
