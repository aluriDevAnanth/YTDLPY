import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface PlayRowButtonProps {
  isCompleted: boolean;
  onClick: () => void;
}

export function PlayRowButton({ isCompleted, onClick }: PlayRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={!isCompleted}
      className="px-1.5 py-1 p-button-sm"
      tooltip={isCompleted ? "Play Video" : "Unavailable while downloading"}
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:play" className="text-lg" />
    </Button>
  );
}

export default PlayRowButton;
