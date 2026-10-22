import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface PauseRowButtonProps {
  onClick: () => void;
}

export function PauseRowButton({ onClick }: PauseRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      severity="warning"
      className="px-1.5 py-1 p-button-sm"
      tooltip="Pause Download/Processing"
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:player-pause" className="text-lg" />
    </Button>
  );
}

export default PauseRowButton;
