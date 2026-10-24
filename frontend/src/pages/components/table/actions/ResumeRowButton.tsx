import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface ResumeRowButtonProps {
  onClick: () => void;
}

export function ResumeRowButton({ onClick }: ResumeRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      severity="success"
      className="px-1.5 py-1 p-button-sm"
      tooltip="Resume Download/Processing"
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:player-play" className="text-lg" />
    </Button>
  );
}

export default ResumeRowButton;
