import { Button } from "primereact/button";

interface StoragePurgeAllButtonProps {
  totalVideosCount: number;
  loading: boolean;
  onClick: () => void;
}

export function StoragePurgeAllButton({
  totalVideosCount,
  loading,
  onClick,
}: StoragePurgeAllButtonProps) {
  return (
    <Button
      label="Purge All Videos"
      icon="pi pi-power-off"
      severity="danger"
      outlined
      size="small"
      className="p-button-sm text-xs"
      onClick={onClick}
      loading={loading}
      disabled={totalVideosCount === 0}
      tooltip="Clear entire download library"
      tooltipOptions={{ position: "bottom" }}
    />
  );
}

export default StoragePurgeAllButton;
