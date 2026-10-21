import { Button } from "primereact/button";

interface StoragePurgeWatchedButtonProps {
  watchedCount: number;
  loading: boolean;
  onClick: () => void;
}

export function StoragePurgeWatchedButton({
  watchedCount,
  loading,
  onClick,
}: StoragePurgeWatchedButtonProps) {
  return (
    <Button
      label="Purge Watched Videos"
      icon="pi pi-check-circle"
      severity="info"
      size="small"
      className="p-button-sm text-xs"
      onClick={onClick}
      loading={loading}
      disabled={watchedCount === 0}
      tooltip="Delete all videos marked as watched to free space"
      tooltipOptions={{ position: "bottom" }}
    />
  );
}

export default StoragePurgeWatchedButton;
