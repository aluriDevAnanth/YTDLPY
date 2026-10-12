import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface AddDownloadButtonProps {
  onClick: () => void;
  isMac?: boolean;
  isMobile?: boolean;
}

export function AddDownloadButton({
  onClick,
  isMac,
  isMobile,
}: AddDownloadButtonProps) {
  if (isMobile) {
    return (
      <Button
        onClick={onClick}
        severity="success"
        aria-label="Add Download"
        tooltip="Add Video (Ctrl+N)"
        className="p-button-sm !p-1 text-xs"
      >
        <Icon icon="tabler:plus" className="text-base" />
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      severity="success"
      className="p-button-sm p-1.5"
      tooltip={`Add Download (${isMac ? "⌘N" : "Ctrl+N"})`}
      tooltipOptions={{ position: "bottom" }}
    >
      <Icon icon="tabler:plus" className="text-lg" />
    </Button>
  );
}

export default AddDownloadButton;
