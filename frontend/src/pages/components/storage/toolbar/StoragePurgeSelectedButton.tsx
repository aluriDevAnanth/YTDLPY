import { Button } from "primereact/button";

interface StoragePurgeSelectedButtonProps {
  selectedCount: number;
  loading: boolean;
  onClick: () => void;
}

export function StoragePurgeSelectedButton({
  selectedCount,
  loading,
  onClick,
}: StoragePurgeSelectedButtonProps) {
  return (
    <Button
      label={`Purge Selected (${selectedCount})`}
      icon="pi pi-trash"
      severity="warning"
      size="small"
      className="p-button-sm text-xs"
      onClick={onClick}
      loading={loading}
      disabled={selectedCount === 0}
      tooltip="Delete selected videos from disk"
      tooltipOptions={{ position: "bottom" }}
    />
  );
}

export default StoragePurgeSelectedButton;
