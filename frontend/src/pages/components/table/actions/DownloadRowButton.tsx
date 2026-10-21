import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface DownloadRowButtonProps {
  isCompleted: boolean;
  onClick: () => void;
}

export function DownloadRowButton({
  isCompleted,
  onClick,
}: DownloadRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={!isCompleted}
      severity="success"
      className="px-1.5 py-1 p-button-sm"
      tooltip={isCompleted ? "Download File" : "Unavailable while downloading"}
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:download" className="text-lg" />
    </Button>
  );
}

export default DownloadRowButton;
