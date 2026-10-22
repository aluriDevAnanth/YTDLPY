import { Button } from "primereact/button";

interface StorageClearCacheButtonProps {
  onClick: () => void;
}

export function StorageClearCacheButton({
  onClick,
}: StorageClearCacheButtonProps) {
  return (
    <Button
      label="Clear App Cache"
      icon="pi pi-refresh"
      severity="secondary"
      outlined
      size="small"
      className="p-button-sm text-xs"
      onClick={onClick}
      tooltip="Reset local browser application state"
      tooltipOptions={{ position: "bottom" }}
    />
  );
}

export default StorageClearCacheButton;
