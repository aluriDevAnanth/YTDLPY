import type { VideoT } from "src/schema";
import { AddToPlaylistRowButton } from "./AddToPlaylistRowButton";
import { DeleteRowButton } from "./DeleteRowButton";
import { DownloadRowButton } from "./DownloadRowButton";
import { InfoRowButton } from "./InfoRowButton";
import { LogsRowButton } from "./LogsRowButton";
import { PauseRowButton } from "./PauseRowButton";
import { ResumeRowButton } from "./ResumeRowButton";
import { RetryRowButton } from "./RetryRowButton";

interface TableRowActionButtonsProps {
  rowData: VideoT;
  isCompleted: boolean;
  onDownload: () => void;
  onShowLogs: () => void;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
  onShowPlaylist: () => void;
  onShowInfo: () => void;
  onDelete: () => void;
}

export function TableRowActionButtons({
  rowData,
  isCompleted,
  onDownload,
  onShowLogs,
  onPause,
  onResume,
  onRetry,
  onShowPlaylist,
  onShowInfo,
  onDelete,
}: TableRowActionButtonsProps) {
  const isPausable = [
    "downloading",
    "queued",
    "generating_sprites",
    "packing_bundle",
  ].includes(rowData.downloadStatus);

  return (
    <div
      className="flex items-center gap-1 md:absolute md:left-full md:top-0 md:ml-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <DownloadRowButton isCompleted={isCompleted} onClick={onDownload} />
      <LogsRowButton onClick={onShowLogs} />
      {isPausable && <PauseRowButton onClick={onPause} />}
      {rowData.downloadStatus === "paused" && <ResumeRowButton onClick={onResume} />}
      {rowData.downloadStatus === "failed" && <RetryRowButton onClick={onRetry} />}
      <AddToPlaylistRowButton onClick={onShowPlaylist} />
      <InfoRowButton onClick={onShowInfo} />
      <DeleteRowButton onClick={onDelete} />
    </div>
  );
}

export default TableRowActionButtons;
